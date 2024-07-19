<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\ProductRequest;
use App\Models\Variant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProductsDeleteJob implements ShouldQueue
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
        try{
            Product::where('product_id',$body['id'])->delete();
            Variant::where('parent_id',$body['id'])->delete();
            ProductRequest::where('product_id',$body['id'])->delete();
        }
        catch(\Exception $e){
            Log::info($e->getMessage());
        }
    }
}
