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

class VariantOutOfStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $shop ,$body;
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
        try{
            // issue fixed
            ProductRequest::where('variant_id', $body['id'])->update(['back_in_stock' => 'pending']);
            ProductRequest::where('variant_id', $body['id'])->update(['in_stock' => (int)$body['inventory_quantity']]);

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
        catch(\Exception $e){
            Log::info($e->getMessage());
        }
    }
}
