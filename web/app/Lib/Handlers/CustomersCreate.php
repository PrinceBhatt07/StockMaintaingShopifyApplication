<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\CustomerCreateJob;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;
use App\Models\Session;

class CustomersCreate implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Customer Create Job Started');
        CustomerCreateJob::dispatch($shop,$body);
    }
}
