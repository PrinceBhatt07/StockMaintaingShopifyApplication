<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\CustomerUpdateJob;
use App\Models\Customer;
use App\Models\ProductRequest;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;
use App\Models\Session;

class CustomersUpdate implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Customer Update Job Start');
        CustomerUpdateJob::dispatch($shop,$body);
    }

}
