<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\ProductsDeleteJob;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;


class ProductsDelete implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Product Delete Job Start');
        ProductsDeleteJob::dispatch($shop,$body);
    }
}
