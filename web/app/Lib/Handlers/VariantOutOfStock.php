<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Jobs\VariantOutOfStockJob;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;
class VariantOutOfStock implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::info('Variant Out of Stock Job Start');
        VariantOutOfStockJob::dispatch($shop,$body);
    }
}
