<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Jobs\Shopify\Sync\Customer;
use App\Jobs\Shopify\Sync\Product;
use App\Jobs\Shopify\Sync\Variant;
use App\Lib\AuthRedirection;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();


    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    $createProduct = Registry::register('/api/webhooks', Topics::PRODUCTS_CREATE, $shop, $session->getAccessToken());
    $updateProduct = Registry::register('/api/webhooks', Topics::PRODUCTS_UPDATE, $shop, $session->getAccessToken());
    $deleteProduct = Registry::register('/api/webhooks', Topics::PRODUCTS_DELETE, $shop, $session->getAccessToken());
    $createCustomer = Registry::register('/api/webhooks', Topics::CUSTOMERS_CREATE, $shop, $session->getAccessToken());
    $updateCustomer = Registry::register('/api/webhooks', Topics::CUSTOMERS_UPDATE, $shop, $session->getAccessToken());
    $deleteCustomer = Registry::register('/api/webhooks', Topics::CUSTOMERS_DELETE, $shop, $session->getAccessToken());
    $variantInStock = Registry::register('/api/webhooks', Topics::VARIANTS_IN_STOCK, $shop, $session->getAccessToken());
    $variantOutOfStock = Registry::register('/api/webhooks', Topics::VARIANTS_OUT_OF_STOCK, $shop, $session->getAccessToken());
    
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    if ($createProduct->isSuccess()) {
        Log::debug("Product Created for shop $shop");
    } else {
        Log::error(
            "Failed to Create Product for shop $shop with response body: " .
                print_r($createProduct->getBody(), true)
        );
    }

    if ($updateProduct->isSuccess()) {
        Log::debug("Product Updated for shop $shop");
    } else {
        Log::error(
            "Failed to Update Product for shop $shop with response body: " .
                print_r($updateProduct->getBody(), true)
        );
    }

    if ($deleteProduct->isSuccess()) {
        Log::debug("Product Deleted for shop $shop");
    } else {
        Log::error(
            "Failed to Delete Product for shop $shop with response body: " .
                print_r($deleteProduct->getBody(), true)
        );
    }

    if ($createCustomer->isSuccess()) {
        Log::debug("Customer Created for shop $shop");
    } else {
        Log::error(
            "Failed to Create Customer for shop $shop with response body: " .
                print_r($createCustomer->getBody(), true)
        );
    }

    if ($updateCustomer->isSuccess()) {
        Log::debug("Customer Updated for shop $shop");
    } else {
        Log::error(
            "Failed to Update Customer for shop $shop with response body: " .
                print_r($updateCustomer->getBody(), true)
        );
    }

    if ($deleteCustomer->isSuccess()) {
        Log::debug("Customer Deleted for shop $shop");
    } else {
        Log::error(
            "Failed to Delete Customer for shop $shop with response body: " .
                print_r($deleteCustomer->getBody(), true)
        );
    }

    if ($variantInStock->isSuccess()) {
        Log::debug("Variant In Stock for shop $shop");
    } else {
        Log::error(
            "Failed to variant in Stock for shop $shop with response body: " .
                print_r($variantInStock->getBody(), true)
        );
    }

    if ($variantOutOfStock->isSuccess()) {
        Log::debug("Variant Out of Stock for shop $shop");
    } else {
        Log::error(
            "Failed to variant Out of Stock for shop $shop with response body: " .
                print_r($variantOutOfStock->getBody(), true)
        );
    }



    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    //Job to populate the Shopify Product and Variant In the Database
    // $store = $shop;
    // Product::dispatch($store);

    //Job to populate the Shopify Customer In the Database
    // Customer::dispatch($store);

    $path = base_path('artisan');
    $command = "php $path PopulateShopifyData:command $shop> /dev/null 2>&1 &";
    Log::info($command);
    //Job to populate the Shopify Customer In the Database
    exec($command);

    return redirect($redirectUrl);
});

Route::get('/api/products/count', function (Request $request) {
    // /* @var AuthSession /
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products/count');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::get('/api/products/create', function (Request $request) {
    // /* @var AuthSession /
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});


// Route::get('/re-register-webhooks', function (Request $request) {
//     $shop = "prince-steststore.myshopify.com";
//     $accessToken = Session::where('shop',$shop)->first('access_token');
//     $response = Registry::register('https://deer-institutes-resident-counsel.trycloudflare.com/api/webhooks', Topics::APP_UNINSTALLED, $shop, $accessToken->access_token);
//     $response2 = Registry::register('https://deer-institutes-resident-counsel.trycloudflare.com/api/webhooks', Topics::PRODUCTS_CREATE, $shop, $accessToken->access_token);
//     if ($response2->isSuccess()) {
//         return "sucess";
//         Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
//     } else {
//         return $response->getBody();
//         Log::error(
//             "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
//                 print_r($response->getBody(), true)
//         );
//     }

// });

// #Reregister webhook in case its removed
// Route::get('/re-register-webhooks', function (Request $request) {
//     $shop= $request->shop;
//     $access_token = Session::where('shop',$shop)->first();
//     $access_token = $access_token->access_token;

//     try{
//         $response = Registry::register('https://deer-institutes-resident-counsel.trycloudflare.com/api/webhooks', Topics::PRODUCTS_CREATE, $shop, $access_token);
//         if($response->isSuccess()){
//             return response()->json([
//                 "message"=>"successfully re-registered webhook",
//                 "status" =>200
//             ]);
//         }else{
//              return $response->getBody();
//         }
               
//     }catch(Exception $e){
//         return response()->json([
//             "message"=>$e->getMessage(),
//             "status" => "500"
//         ]);
//     }
// });
