<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\ProductRequest;
use App\Models\Session;
use App\Models\Variant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductsUpdateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $body, $shop;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($shop,$body)
    {
        $this->body = $body;
        $this->shop = $shop;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $body = $this->body;
        $shop = $this->shop;

        Log::debug("Product updated");
        Log::info(json_encode($body));

        $vendor = $body['vendor'] ?? null;
        $id = $body['id'] ?? null;
        $variantData = $body['variants'] ?? null;

        $imageUrl = [];
        if ($vendor && $id && $variantData) {
            $accessToken = Session::where('shop', $shop)->value('access_token');

            if ($accessToken) {

                $shopifyApiUrl = "https://{$shop}/admin/api/2023-10/products/{$id}/images.json";

                $response = Http::withHeaders([
                    'X-Shopify-Access-Token' => $accessToken,
                ])->get($shopifyApiUrl);

                $imageUrl = $response->json();
                
                $imageUrl = $imageUrl['images'];
                Log::info($imageUrl);
                
            }
        }

        try {
            $preVariants = Variant::where('parent_id', $body['id'])->pluck('variant_id')->toArray();
            $variants = $body['variant_ids'];
            
            if (count($variants) > 1) {
                foreach ($variants as $variant) {
                    Variant::where('parent_id',$body['id'])->where('title','Default Title')->delete();
                    ProductRequest::where('product_id',$body['id'])->where('variant_name','Default Title')->delete();
                }
            }


            if (count($preVariants) <= count($variants)) {
                $products = [
                    'product_id' => $body['id'],
                    'title' => $body['title'],
                    'body_html' => $body['body_html'],
                    'vendor' => $body['vendor'],
                    'product_type' => $body['product_type'],
                    'created_at' => $body['created_at'],
                    'handle' => $body['handle'],
                    'updated_at' => $body['updated_at'],
                    'images' => json_encode($imageUrl),
                    'row' => json_encode($body['updated_at']),
                    'row' => json_encode($body['template_suffix']),
                    'row' => json_encode($body['published_scope']),
                    'row' => json_encode($body['tags']),
                    'row' => json_encode($body['status']),
                    'row' => json_encode($body['admin_graphql_api_id']),
                    'row' => json_encode($body['options']),
                    'row' => json_encode($body['image']),
                    'row' => json_encode($body['variants']),
                ];
                Product::updateOrCreate(['product_id' => $body['id']], $products);
                ProductRequest::where('product_id',$body['id'])->update(['product_name'=>$body['title']]);

                foreach ($variantData as $variants) {
                    
                    if (!empty($variants['sku'])) {
                        $payload = [
                            'variant_id' => $variants['id'],
                            'parent_id' => $variants['product_id'],
                            'title' => $variants['title'],
                            'price' => $variants['price'],
                            'sku' => $variants['sku'],
                            'inventory_quantity' => $variants['inventory_quantity'],
                            'old_inventory_quantity' => $variants['old_inventory_quantity'],
                            'created_at' => $variants['created_at'],
                            'updated_at' => $variants['updated_at'],
                            'weight' => $variants['weight'],
                            'weight_unit' => $variants['weight_unit'],
                            'other_variant_informations' => json_encode([
                                'position' => $variants['position'],
                                'inventory_policy' => $variants['inventory_policy'],
                                'compare_at_price' => $variants['compare_at_price'],
                                'inventory_management' => $variants['inventory_management'],
                                'fulfillment_service' => $variants['fulfillment_service'],
                                'admin_graphql_api_id' => $variants['admin_graphql_api_id'],
                                'taxable' => $variants['taxable'],
                                'barcode' => $variants['barcode'],
                                'grams' => $variants['grams']
                            ])
                        ];
                        Variant::updateOrCreate(['variant_id' => $variants['id']], $payload);

                        ProductRequest::where('variant_id', $variants['id'])->update([
                            'variant_name' => $variants['title'],
                            'variant_sku' => $variants['sku']
                        ]);
                    }
                }
            }

            if (count($preVariants) > count($variants)) {
                $preVariantIds = $preVariants;
                $variantIds = array_column($variants, 'id');
                $getDeletedVariantId = array_diff($preVariantIds, $variantIds);

                foreach ($getDeletedVariantId as $variantId) {
                    Variant::where('variant_id', $variantId)->delete();
                }
            }

            $this->updateStockInRequest($body);
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }

    public function updateStockInRequest($body)
    {
        try {
            $requestedProducts = ProductRequest::where('product_id', $body['id'])->get();

            foreach ($requestedProducts as $requestedProduct) {
                $variantData = collect($body['variants'])->firstWhere('id', $requestedProduct->variant_id);

                if ($variantData) {
                    $inStockQuantity = $variantData['inventory_quantity'];
                    $requestedProduct->update(['in_stock' => $inStockQuantity]);

                    if ($inStockQuantity > 0) {
                        $requestedProduct->update(['back_in_stock' => 'active']);
                    }
                }
            }

            ProductRequest::where('product_id', $body['id'])->update(['product_name' => $body['title']]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }
}
