<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_requests', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('product_id')->nullable();
            $table->bigInteger('variant_id')->nullable();
            $table->bigInteger('customer_id')->nullable();
            $table->string('brand')->nullable();
            $table->string('image_url')->nullable();
            $table->string('variant_sku')->nullable();
            $table->string('product_name')->nullable();
            $table->string('variant_name')->nullable();
            $table->string('quantity_needed')->default(0);
            $table->string('in_stock')->default(0);
            $table->string('customer_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('message_status')->default('pending');
            $table->string('back_in_stock')->default('pending');
            $table->string('archived')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_requests');
    }
}
