<?php

namespace App\Jobs\Shopify\Sync;

use App\Traits\FunctionTrait;
use App\Traits\RequestTrait;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Helpers\Helper;
use App\Models\Session;
use App\Models\Variant as ModelsVariant;
use Illuminate\Support\Facades\Http;

class Variant implements ShouldQueue
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
        // $this->user = $user;
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
            
            foreach ($products['products'] as $variants) {
                $this->updateOrCreateThisProductInDB($variants['variants']);
            }
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }


    public function updateOrCreateThisProductInDB($variants)
    {
        
        try {
            foreach($variants as $product){
            $payload = [
                'variant_id' => $product['id'],
                'parent_id' => $product['product_id'],
                'title' => $product['title'],
                'price' => $product['price'],
                'sku' => $product['sku'],
                'inventory_quantity' => $product['inventory_quantity'],
                'old_inventory_quantity' => $product['old_inventory_quantity'],
                'created_at' => $product['created_at'],
                'updated_at' => $product['updated_at'],
                'weight' => $product['weight'],
                'weight_unit' => $product['weight_unit'],
                'other_variant_informations' => json_encode($product['position']),
                'other_variant_informations' => json_encode($product['inventory_policy']),
                'other_variant_informations' => json_encode($product['compare_at_price']),
                'other_variant_informations' => json_encode($product['inventory_management']),
                'other_variant_informations' => json_encode($product['fulfillment_service']),
                'other_variant_informations' => json_encode($product['admin_graphql_api_id']),
                'other_variant_informations' => json_encode($product['taxable']),
                'other_variant_informations' => json_encode($product['barcode']),
                'other_variant_informations' => json_encode($product['grams']),
            ];
        }
        ModelsVariant::Create($payload);
            return true;
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }
}
