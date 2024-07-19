<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\ProductsUpdateJob;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class ProductsUpdate implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Product Update Job Start');
        ProductsUpdateJob::dispatch($shop,$body);
    }
}
