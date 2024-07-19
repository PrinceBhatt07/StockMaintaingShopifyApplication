<?php

namespace App\Jobs;

use App\Models\ProductRequest;
use App\Models\Variant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VariantInStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $shop,$body;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($shop,$body)
    {
        $this->shop = $shop;
        $this->body = $body;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $body = $this->body;
        Log::info(json_encode($body));
        try {
            $requiredQuantity =  ProductRequest::where('variant_id', $body['id'])->first();
            $newQuantity = (int)$body['inventory_quantity'];

            // issue fixed
                ProductRequest::where('variant_id', $body['id'])->update(['back_in_stock' => 'active']);
                ProductRequest::where('variant_id', $body['id'])->update(['in_stock' => (int)$body['inventory_quantity']]);
            
            if (!empty($body['sku'])) {
                Variant::where('variant_id', $body['id'])->update([
                    'variant_id' => $body['id'],
                    'parent_id' => $body['product_id'],
                    'title' => $body['title'],
                    'price' => $body['price'],
                    'sku' => $body['sku'],
                    'inventory_quantity' => $body['inventory_quantity'],
                    'old_inventory_quantity' => $body['old_inventory_quantity'],
                    'created_at' => $body['created_at'],
                    'updated_at' => $body['updated_at'],
                    'weight' => $body['weight'],
                    'weight_unit' => $body['weight_unit'],
                    'other_variant_informations' => json_encode($body['position']),
                    'other_variant_informations' => json_encode($body['inventory_policy']),
                    'other_variant_informations' => json_encode($body['compare_at_price']),
                    'other_variant_informations' => json_encode($body['inventory_management']),
                    'other_variant_informations' => json_encode($body['fulfillment_service']),
                    'other_variant_informations' => json_encode($body['admin_graphql_api_id']),
                    'other_variant_informations' => json_encode($body['taxable']),
                    'other_variant_informations' => json_encode($body['barcode']),
                    'other_variant_informations' => json_encode($body['grams']),
                ]);
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
                }
            }
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }
}
