<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\ProductsCreateJob;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class ProductsCreate implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Product Create Job Started');
        ProductsCreateJob::dispatch($shop,$body);
    }
}
