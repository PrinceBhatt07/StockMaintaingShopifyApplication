<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Session;
use App\Models\Variant;
use Exception;
use Illuminate\Support\Facades\Http;
use Shopify\Clients\Rest;

class PopulateShopifyCustomers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'PopulateShopifyData:command {shop}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public $shop;
    public $token;

    public function handle()
    {
        try {

            $shop = $this->argument('shop');
            $accessToken = Session::where('shop', $shop)->value('access_token');
            $page_info = '';

            $client = new Rest($shop, $accessToken);
            //  do {
            //     $result = $client->get(path: 'customers', query: ["limit" => "250", "page_info" => $page_info]);
            //     $customers = $result->getDecodedBody();

            //     foreach ($customers['customers'] as $customer) {
            //         $this->saveCustomerResponseInDB($customer);
            //     }

            //     $serializedPageInfo = ($result->getPageInfo() == null) ? null : serialize($result->getPageInfo());
            //     Log::info(json_encode($serializedPageInfo));
            //     $pageInfo = ($serializedPageInfo == null) ? null : unserialize($serializedPageInfo);
            //     if ($pageInfo != null) {
            //         $page_info = ($pageInfo->hasNextPage()) ?  $pageInfo->getNextPageQuery()['page_info'] : "";
            //     } else {
            //         $page_info = "";
            //     }
            // } while ($page_info != "");

            $this->populatProductsAndVarinatsInDB();
        } catch (Exception $e) {
            Log::info($e->getMessage() . ' ' . $e->getLine());
        }
    }

    public function saveCustomerResponseInDB($customer)
    {
        $address = array_key_exists("address", $customer) ? $customer['address'] : [];
        $default_address = array_key_exists("default_address", $customer) ? $customer['default_address'] : [];

        try {
            $payload = [
                'customer_id' => $customer['id'],
                'email' => $customer['email'],
                'created_at' => $customer['created_at'],
                'updated_at' => $customer['updated_at'],
                'first_name' => $customer['first_name'],
                'last_name' => $customer['last_name'],
                'orders_count' => (int)$customer['orders_count'],
                'phone' => $customer['phone'],
                'row' => json_encode($customer['state']),
                'row' => json_encode($customer['total_spent']),
                'row' => json_encode($customer['last_order_id']),
                'row' => json_encode($customer['note']),
                'row' => json_encode($customer['verified_email']),
                'row' => json_encode($customer['multipass_identifier']),
                'row' => json_encode($customer['tax_exempt']),
                'row' => json_encode($customer['tags']),
                'row' => json_encode($customer['last_order_name']),
                'row' => json_encode($customer['currency']),
                'row' => json_encode($address),
                'row' => json_encode($customer['admin_graphql_api_id']),
                'row' => json_encode($default_address),
            ];

            Customer::updateOrCreate(['customer_id' => $customer['id']], $payload);
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }

    public function populatProductsAndVarinatsInDB()
    {
        try {

            $shop = $this->argument('shop');
            $accessToken = Session::where('shop', $shop)->value('access_token');
            $page_info = '';


            $client = new Rest($shop, $accessToken);
            do {
            sleep(1);
            $result = $client->get(path: 'products', query: ["limit" => "250", "page_info" => $page_info]);
            $products = $result->getDecodedBody();

            foreach ($products['products'] as $product) {
                $this->updateOrCreateThisProductInDB($product, $shop,);
                $this->updateOrCreateThisVariantInDB($product['variants']);
            }
            Log::info('Successfully----');
            $serializedPageInfo = ($result->getPageInfo() == null) ? null : serialize($result->getPageInfo());

            $pageInfo = ($serializedPageInfo == null) ? null : unserialize($serializedPageInfo);
            if ($pageInfo != null) {
                $page_info = ($pageInfo->hasNextPage()) ?  $pageInfo->getNextPageQuery()['page_info'] : "";
            } else {
                $page_info = "";
            }
            } while ($page_info != "");

        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }

    public function updateOrCreateThisProductInDB($product, $shop)
    {

        $accessToken = Session::where('shop', $shop)->value('access_token');
        $id = $product['id'];
        $imageUrl = [];
        if ($accessToken) {
            sleep(1);
            $shopifyApiUrl = "https://{$shop}/admin/api/2023-10/products/{$id}/images.json";

            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $accessToken,
            ])->get($shopifyApiUrl);

            $imageUrl = $response->json();
            Log::info(json_encode($imageUrl));
            $imageUrl = $imageUrl['images'];
    
        }

        try {
            $payload = [
                'title' => $product['title'],
                'body_html' => $product['body_html'],
                'vendor' => $product['vendor'],
                'product_type' => $product['product_type'],
                'created_at' => $product['created_at'],
                'handle' => $product['handle'],
                'updated_at' => $product['updated_at'],
                'images' => json_encode($imageUrl),
                'row' => json_encode($product['published_at']),
                'row' => json_encode($product['template_suffix']),
                'row' => json_encode($product['published_scope']),
                'row' => json_encode($product['tags']),
                'row' => json_encode($product['status']),
                'row' => json_encode($product['admin_graphql_api_id']),
                'row' => json_encode($product['options']),
                'row' => json_encode($product['image']),
                'row' => json_encode($product['variants']),
            ];
            Product::updateOrCreate(['product_id' => $product['id']], $payload);
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }

    public function updateOrCreateThisVariantInDB($variants)
    {
        try {
            foreach ($variants as $variant) {
                // Check if the SKU is empty
                if (!empty($variant['sku'])) {
                    $variantData = [
                        'parent_id' => $variant['product_id'],
                        'title' => $variant['title'],
                        'price' => $variant['price'],
                        'sku' => $variant['sku'],
                        'inventory_quantity' => $variant['inventory_quantity'],
                        'old_inventory_quantity' => $variant['old_inventory_quantity'],
                        'created_at' => $variant['created_at'],
                        'updated_at' => $variant['updated_at'],
                        'weight' => $variant['weight'],
                        'weight_unit' => $variant['weight_unit'],
                        'other_variant_informations' => json_encode([
                            'position' => $variant['position'],
                            'inventory_policy' => $variant['inventory_policy'],
                            'compare_at_price' => $variant['compare_at_price'],
                            'inventory_management' => $variant['inventory_management'],
                            'fulfillment_service' => $variant['fulfillment_service'],
                            'admin_graphql_api_id' => $variant['admin_graphql_api_id'],
                            'taxable' => $variant['taxable'],
                            'barcode' => $variant['barcode'],
                            'grams' => $variant['grams'],
                        ]),
                    ];
                    // Update or create variant
                    Variant::updateOrCreate(['variant_id' => $variant['id']], $variantData);
                }
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }
}
