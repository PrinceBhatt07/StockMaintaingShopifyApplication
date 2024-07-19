<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Lib\ProductCreator;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    echo phpinfo();
});


Route::get('/populate_products',[ProductController::class,'syncProducts']);
Route::get('/populate_customers',[ProductController::class,'syncCustomers']);
// Route::get('/populate_variants',[ProductController::class,'syncVariants']);

Route::get('/get_outstock_products',[ProductController::class,'getProducts']);
Route::get('/get_customers',[ProductController::class,'getCustomers']);
Route::post('/create-request',[ProductController::class,'createRequest'])->name('createRequest');

Route::get('/get_requested_products',[ProductController::class,'getRequestedProduct']);
Route::get('/get_backInStock_products',[ProductController::class,'getBackInStockProduct']);
Route::get('/get_archived_products',[ProductController::class,'getArchivedProduct']);

Route::post('/archive_product',[ProductController::class,'archiveProduct'])->name('archiveProduct');

Route::post('/back_in_stock_product',[ProductController::class,'backInStockProduct'])->name('backInStockProduct');

Route::post('/unarchived_request',[ProductController::class,'unarchivedRequest']);

Route::post('/delete-request',[ProductController::class,'deleteRequest']);

Route::post('/editRequest',[ProductController::class,'editRequest']);
Route::post('/bulk-action-for-archive',[ProductController::class,'bulkArchiveProducts']);

Route::post('/bulk-action-for-unarchive',[ProductController::class,'bulkUnarchiveProducts']);

Route::post('/bulk-action-for-delete',[ProductController::class,'bulkdeleteProducts']);
Route::post('/message-sent',[ProductController::class,'messageSent']);

Route::get('/hit-crone-job',[ProductController::class,'excecuteCronJob']);

Route::get('/populate-imgaes',[ProductController::class,'populateImages']);

Route::post('/editNotes',[ProductController::class,'editNotes']);

// Route::post('/sorting_columns',[ProductController::class,'sortingColumns']);

// Route::post('/searching_in_requested_product',[ProductController::class,'searchingInRequestProducts']);
// Route::post('/searching_in_back_in_stock',[ProductController::class,'searchingInBackInStock']);
// Route::post('/searching_in_archived_product',[ProductController::class,'searchingInArchived']);

// Route::post('/filter-by-date',[ProductController::class,'filterByDate']);

