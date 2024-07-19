<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\VariantInStockJob;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;

class VariantInStock implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
       Log::info('Variant In Stock job Start');
       VariantInStockJob::dispatch($shop,$body);
    }
}
