<?php

namespace App\Jobs\Shopify\Sync;

use App\Models\Customer as ModelsCustomer;
use App\Models\Session;
use App\Models\Store;
use App\Traits\FunctionTrait;
use App\Traits\RequestTrait;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Customer implements ShouldQueue
{

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    use FunctionTrait, RequestTrait;
    public $store;
    public $user;
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
          
            $shop =  $this->store;

            $shopifyApiUrl = "https://{$shop}/admin/api/2024-01/customers.json";

            $accessToken = Session::where('shop', $shop)->value('access_token');

            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $accessToken,
            ])->get($shopifyApiUrl);

            $customers = $response->json();

            
            foreach ($customers['customers'] as $customer) {
                $this->saveCustomerResponseInDB($customer);
            }
        } catch (Exception $e) {
            Log::info($e->getMessage() . ' ' . $e->getLine());
        }
    }


    public function saveCustomerResponseInDB($customer)
    {
        $address = array_key_exists("address", $customer) ? $customer['address'] : [];
        $default_address = array_key_exists("default_address", $customer) ? $customer['default_address'] : [];

        try {
            $payload = [
                'customer_id' => $customer['id'],
                'email' => $customer['email'],
                'created_at' => $customer['created_at'],
                'updated_at' => $customer['updated_at'],
                'first_name' => $customer['first_name'],
                'last_name' => $customer['last_name'],
                'orders_count' => (int)$customer['orders_count'],
                'phone' => $customer['phone'],
                'row' => json_encode($customer['state']),
                'row' => json_encode($customer['total_spent']),
                'row' => json_encode($customer['last_order_id']),
                'row' => json_encode($customer['note']),
                'row' => json_encode($customer['verified_email']),
                'row' => json_encode($customer['multipass_identifier']),
                'row' => json_encode($customer['tax_exempt']),
                'row' => json_encode($customer['tags']),
                'row' => json_encode($customer['last_order_name']),
                'row' => json_encode($customer['currency']),
                'row' => json_encode($address),
                'row' => json_encode($customer['admin_graphql_api_id']),
                'row' => json_encode($default_address),
            ];
            
            ModelsCustomer::updateOrCreate(['customer_id' => $customer['id']], $payload);
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }
}
