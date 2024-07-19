<?php

namespace App\Jobs\Shopify\Sync;

use App\Models\Logs;
use App\Models\Product as ModelsProduct;
use App\Traits\FunctionTrait;
use App\Traits\RequestTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Models\Session;
use App\Models\Variant;
use Illuminate\Support\Facades\Http;

class Product implements ShouldQueue
{

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    use FunctionTrait, RequestTrait;
    public $user, $store;
    /**
     * Create a new job instance.
     * @return void
     */
    public function __construct($store)
    {
        $this->store = $store;
    }

    /**
     * Execute the job.
     * @return void
     */
    public function handle()
    {
        try {

            $shop = $this->store;

            $shopifyApiUrl = "https://{$shop}/admin/api/2024-01/products.json";


            $accessToken = Session::where('shop', $shop)->value('access_token');
            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $accessToken,
            ])->get($shopifyApiUrl);

            $products = $response->json();

            Logs::create([
                'populate_product' => json_encode($products)
            ]);
            
            foreach ($products['products'] as $product) {
                $this->updateOrCreateThisProductInDB($product);
            }

              Logs::create([
                'populate_product_completion' => 'completed_populating_products'
            ]);

     
            foreach ($products['products'] as $variants) {
                $this->updateOrCreateThisVariantInDB($variants['variants']);
            }

            Logs::create([
                'populate_product_completion' => 'completed_populating_variants'
            ]);

  

        } catch (\Exception $e) {
            Log::info(json_encode($e->getMessage()));
        }
    }


    public function updateOrCreateThisProductInDB($product)
    {
        Logs::create([
                'populate_product_completion' => 'updateOrCreateThisProductInDB start'
            ]);

        try {
            $payload = [
                'title' => $product['title'],
                'body_html' => $product['body_html'],
                'vendor' => $product['vendor'],
                'product_type' => $product['product_type'],
                'created_at' => $product['created_at'],
                'handle' => $product['handle'],
                'updated_at' => $product['updated_at'],
                'images' => json_encode($product['images']),
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

            ModelsProduct::updateOrCreate(['product_id' => $product['id']], $payload);
               Logs::create([
                'populate_product_completion' => 'updateOrCreateThisProductInDB end'
            ]);

        } catch (\Exception $e) {
            Log::info(json_encode($e->getMessage()));
        }
    }

    public function updateOrCreateThisVariantInDB($variants)
    {
           Logs::create([
                'populate_product_completion' => 'updateOrCreateThisVariantInDB end'
            ]);
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
               Logs::create([
                'populate_product_completion' => 'updateOrCreateThisVariantInDB end'
            ]);
        } catch (\Exception $e) {
            Log::error(json_encode($e->getMessage()));
        }
    }
}
