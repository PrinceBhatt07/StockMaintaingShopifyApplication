<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\CustomerDeleteJob;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class CustomersDelete implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Customer Delete Job Start');
        CustomerDeleteJob::dispatch($shop,$body);
    }
}
