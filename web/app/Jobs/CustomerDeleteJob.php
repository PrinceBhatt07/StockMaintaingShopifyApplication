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

class CustomerDeleteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $shop, $body;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($shop, $body)
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
        try {
            Customer::where('customer_id', $body['id'])->delete();
            ProductRequest::where('customer_id', $body['id'])->delete();
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }
}
