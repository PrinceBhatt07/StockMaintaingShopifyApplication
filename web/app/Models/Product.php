<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'table_id';
    protected $fillable = [
        'product_id',
        'title',
        'body_html',
        'vendor',
        'product_type',
        'created_at',
        'handle',
        'updated_at',
        'images',
        'row'
    ];
    public $timestamps = false;

    public function variants(){
        return $this->hasMany(Variant::class,'parent_id','product_id');
    }


}