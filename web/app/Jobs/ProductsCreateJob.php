<?php

namespace App\Jobs;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProductsCreateJob implements ShouldQueue
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
        try {
            $products = [
                'product_id' => $body['id'],
                'title' => $body['title'],
                'body_html' => $body['body_html'],
                'vendor' => $body['vendor'],
                'product_type' => $body['product_type'],
                'created_at' => $body['created_at'],
                'handle' => $body['handle'],
                'updated_at' => $body['updated_at'],
                'images' => json_encode($body['images']),
                'row' => json_encode($body['published_at']),
                'row' => json_encode($body['template_suffix']),
                'row' => json_encode($body['published_scope']),
                'row' => json_encode($body['tags']),
                'row' => json_encode($body['status']),
                'row' => json_encode($body['admin_graphql_api_id']),
                'row' => json_encode($body['options']),
                'row' => json_encode($body['image']),
                'row' => json_encode($body['variants']),
            ];

            $say = Product::updateOrCreate(['product_id' => $body['id']], $products);
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }
}
