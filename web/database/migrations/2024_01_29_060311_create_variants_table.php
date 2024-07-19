<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVariantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('variants', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('variant_id');
            $table->unsignedBigInteger('parent_id')->index();
            $table->foreign('parent_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->integer('price')->default(0);
            $table->string('sku')->nullable();
            $table->integer('inventory_quantity')->default(0);
            $table->integer('old_inventory_quantity')->default(0);
            $table->longText('other_variant_informations')->nullable();
            $table->integer('weight')->default(0);
            $table->string('weight_unit')->nullable();
            $table->string('created_at')->nullable();
            $table->string('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('variants');
    }
}
