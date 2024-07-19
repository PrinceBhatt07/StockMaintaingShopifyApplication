<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductRequest;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;
use App\Models\Session;
use App\Models\Variant;
use Illuminate\Support\Facades\DB;

class AppUninstalled implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::debug("App was uninstalled from $shop - removing all sessions");
        Session::where('shop', $shop)->delete();
        
        Product::getQuery()->delete();
        Variant::getQuery()->delete();
        Customer::getQuery()->delete();
        Session::getQuery()->delete();
        ProductRequest::getQuery()->delete();

    }
}
