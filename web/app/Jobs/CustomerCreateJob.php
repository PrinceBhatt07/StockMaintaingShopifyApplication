<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CustomerCreateJob implements ShouldQueue
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
        $shop = $this->shop;

        $default_address = array_key_exists("default_address", $body) ? json_encode($body['default_address']) : json_encode($body['addresses']);
        $default_address  = $default_address=="" ? json_encode(['test'=>'nbvn']): $default_address;
        try {
            $customer = [
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
                'row' => $default_address
            ];
            Customer::Create($customer);
            Log::info('created');
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }
}
