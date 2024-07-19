<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Models\ProductRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CustomerUpdateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $shop , $body;
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
            Customer::where('customer_id', $body['id'])->update([
                'customer_id' => $body['id'],
                'email' => $body['email'],
                'created_at' => $body['created_at'],
                'updated_at' => $body['updated_at'],
                'first_name' => $body['first_name'],
                'last_name' => $body['last_name'],
                'orders_count' => (int)$body['orders_count'],
                'phone' => $body['phone'],
                'row' => json_encode($body['state']),
                'row' => json_encode($body['total_spent']),
                'row' => json_encode($body['last_order_id']),
                'row' => json_encode($body['note']),
                'row' => json_encode($body['verified_email']),
                'row' => json_encode($body['multipass_identifier']),
                'row' => json_encode($body['tax_exempt']),
                'row' => json_encode($body['tags']),
                'row' => json_encode($body['last_order_name']),
                'row' => json_encode($body['currency']),
                'row' => json_encode($body['addresses']),
                // 'row' => json_encode($body['admin_graphql_api_id']),
            ]);
            
            ProductRequest::where('customer_id', $body['id'])->update([
                'customer_name' =>  $body['first_name'] . ' ' . $body['last_name'],
                'phone' => $body['phone']
            ]);   
              
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }
}
