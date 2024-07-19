<?php

namespace App\Providers;

use App\Lib\DbSessionStorage;
use App\Lib\Handlers\AppUninstalled;
use App\Lib\Handlers\CustomersCreate;
use App\Lib\Handlers\CustomersDelete;
use App\Lib\Handlers\CustomersUpdate;
use App\Lib\Handlers\ProductsCreate;
use App\Lib\Handlers\Privacy\CustomersDataRequest;
use App\Lib\Handlers\Privacy\CustomersRedact;
use App\Lib\Handlers\Privacy\ShopRedact;
use App\Lib\Handlers\ProductsDelete;
use App\Lib\Handlers\ProductsUpdate;
use App\Lib\Handlers\VariantInStock;
use App\Lib\Handlers\VariantOutOfStock;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Shopify\Context;
use Shopify\ApiVersion;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     * @throws \Shopify\Exception\MissingArgumentException
     */
    public function boot()
    {
        $host = str_replace('https://', '', env('HOST', 'not_defined'));

        $customDomain = env('SHOP_CUSTOM_DOMAIN', null);
        Context::initialize(
            env('SHOPIFY_API_KEY', 'not_defined'),
            env('SHOPIFY_API_SECRET', 'not_defined'),
            env('SCOPES', 'not_defined'),
            $host,
            new DbSessionStorage(),
            ApiVersion::LATEST,
            true,
            false,
            null,
            '',
            null,
            (array)$customDomain,
        );

        URL::forceRootUrl("https://$host");
        URL::forceScheme('https');

        Registry::addHandler(Topics::APP_UNINSTALLED, new AppUninstalled());
        Registry::addHandler(Topics::PRODUCTS_CREATE, new ProductsCreate());
        Registry::addHandler(Topics::PRODUCTS_UPDATE, new ProductsUpdate());
        Registry::addHandler(Topics::PRODUCTS_DELETE, new ProductsDelete());
        Registry::addHandler(Topics::CUSTOMERS_CREATE, new CustomersCreate());
        Registry::addHandler(Topics::CUSTOMERS_UPDATE, new CustomersUpdate());
        Registry::addHandler(Topics::CUSTOMERS_DELETE, new CustomersDelete());
        Registry::addHandler(Topics::VARIANTS_IN_STOCK, new VariantInStock());
        Registry::addHandler(Topics::VARIANTS_OUT_OF_STOCK, new VariantOutOfStock());

        /*
         * This sets up the mandatory privacy webhooks. You’ll need to fill in the endpoint to be used by your app in
         * the “Privacy webhooks” section in the “App setup” tab, and customize the code when you store customer data
         * in the handlers being registered below.
         *
         * More details can be found on shopify.dev:
         * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks
         *
         * Note that you'll only receive these webhooks if your app has the relevant scopes as detailed in the docs.
         */
        Registry::addHandler('CUSTOMERS_DATA_REQUEST', new CustomersDataRequest());
        Registry::addHandler('CUSTOMERS_REDACT', new CustomersRedact());
        Registry::addHandler('SHOP_REDACT', new ShopRedact());
    }
}
