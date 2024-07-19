<?php

namespace App\Http\Controllers;

use App\Jobs\Shopify\Sync\Product;
use Illuminate\Http\Request;
use App\Jobs\Shopify\Sync\Customer;
use App\Models\Customer as ModelsCustomer;
use App\Models\Product as ModelsProduct;
use App\Models\ProductRequest;
use App\Models\Session;
use App\Models\Variant as ModelsVariant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    //
    public function syncProducts()
    {
        try {
            $store = env('SHOP');

            Product::dispatch($store);

            return response()->json(['success', 'Product sync successfully']);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    }

    public function syncCustomers()
    {
        try {
            $store = env('SHOP');

            Customer::dispatch($store);

            return response()->json(['success', 'Customer sync successfully']);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    }

    // public function syncVariants()
    // {
    //     try {
    //         $store = env('SHOP');

    //         ModelsVariant::dispatch($store);

    //         return response()->json(['success', 'Variant sync successfully']);
    //     } catch (\Exception $e) {
    //         dd($e->getMessage());
    //     }
    // }

    public function getProducts()
    {

        try {

            $ProductsId = ModelsVariant::all()->pluck('parent_id')->toArray();
            $products = ModelsProduct::select('table_id', 'product_id', 'title', 'body_html','vendor','product_type','created_at','handle','updated_at','images')
                                            ->whereIn('product_id', $ProductsId)
                                            ->with('variants')
                                            ->get();

            if (!$products) {
                $response = [
                    'status' => 'error',																												
                    'message' => 'No Product Found',
                ];
                return response()->json($response, 404);
            } else {
                $response = [
                    'status' => 'success',
                    'message' => 'Array of Out of stock Products',
                    'data' => $products					
                ];
                return response()->json($response, 200);
            }
 
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch products which are out of stock', 'message' => $e->getMessage()], 500);
        }
    }

    public function getCustomers()
    {
        try {

            $allCustomers = ModelsCustomer::all()->toArray();

            if (!$allCustomers) {
                $response = [
                    'status' => 'error',
                    'message' => 'No Customer Found',
                ];
                return response()->json($response, 404);
            } else {
                $response = [
                    'status' => 'success',
                    'message' => 'Array of All Customers',
                    'data' => $allCustomers
                ];
                return response()->json($response, 200);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch Customers', 'message' => $e->getMessage()], 500);
        }
    }

    public function createRequest(Request $request)
    {
        //For new Customers
        if ($request->customer_name && $request->customer_contact) {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required',
                'variant_id' => 'required',
                'quantity_needed' => 'integer|required',
                'customer_name' => 'string|required',
                'customer_contact' => 'max:14|required',
            ]);
        } else {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required',
                'variant_id' => 'required',
                'quantity_needed' => 'integer|required',
                'customer_id' => 'integer',
            ]);
        }

        if ($validator->fails()) {
            $errors = $validator->errors()->all();
            $response = [
                'status' => 'error',
                'message' => [$errors],
            ];
            
            return response()->json($response, 401);
        }

        try {
            $product = ModelsProduct::where('product_id', $request->product_id)->first();

            if (!$product) {
                $response = [
                    'status' => 'error',
                    'data' => 'No Product With this product_id found',
                ];
                return response()->json($response, 404);
            } else {
                $productArray = $product->toArray();
            }
            $productImg = json_decode($productArray['images'], true);

            $matching_src = null;
            foreach ($productImg as $image) {
                if (in_array($request->variant_id, $image['variant_ids'])) {
                    $matching_src = $image['src'];
                    break;
                }
            }

            if ($matching_src === null) {
                $src = null;
            } else {
                $src = $matching_src;
            }

            $variants = ModelsVariant::where('variant_id', $request->variant_id)->first();

            if (!$variants) {
                $response = [
                    'status' => 'error',
                    'data' => 'No Variant With this variant_id found',
                ];
                return response()->json($response, 404);
            } else {
                $variantsArray = $variants->toArray();
            }

            $customer = ModelsCustomer::where('customer_id', $request->customer_id)->first();

            if (!$customer) {
                $customerName = $request->customer_name;
                $customerContact = $request->customer_contact;
            } else {
                $customerName = $customer->first_name . ' ' . $customer->last_name;
                $customerContact = $customer->phone;
            }

            // issue fixed

            $productDetail = ModelsProduct::where('product_id', $request->product_id)->with('variants')->get()->toArray();
            $variants = $productDetail[0]['variants'];
     
            $imageArray = json_decode($productDetail[0]['images']);
            $imageUrl='';
            foreach($variants as $variant){
                
                if($variant['title'] === 'Default Title' || $variant['title'] === 'Default'){

                    $imageUrl = $imageArray[0]->src;
                }
                else if(count($imageArray[0]->variant_ids) > 0){
                    foreach($imageArray[0]->variant_ids as $variantID){      
                        if($variant['variant_id'] === $variantID){
                            $imageUrl = $imageArray[0]->src;
                        }
                    };
                }else{
                    $imageUrl = $imageArray[0]->src;
                }
            }
            
            $productResults = ProductRequest::where('product_name', $productArray['title'])->where('customer_name', $customerName)->get()->toArray();
          
            //added Condition
            
            $checkProductIsArchived = ProductRequest::where('product_name', $productArray['title'])->where('customer_name', $customerName)->where('archived', 'active')->exists();
            //added column
            
            $notes = (!empty($request->notes)) ? $request->notes : "";
            if($checkProductIsArchived){
                $productRequest = new ProductRequest();
                $productRequest->product_id = $request->product_id;
                $productRequest->variant_id = $request->variant_id;
                $productRequest->customer_id = $request->customer_id;
                $productRequest->brand = $productArray['vendor'];
                $productRequest->variant_sku = $variantsArray['sku'];
                $productRequest->product_name = $productArray['title'];
                $productRequest->variant_name = $variantsArray['title'];
                $productRequest->image_url = $imageUrl;
                $productRequest->quantity_needed = $request->quantity_needed;
                $productRequest->in_stock = $variantsArray['inventory_quantity'];
                $productRequest->customer_name = $customerName;
                $productRequest->phone = $customerContact;
                $productRequest->back_in_stock = "pending";
                $productRequest->archived = "pending";
                $productRequest->notes = $notes;
                $productRequest->save();

                $response = [
                    'status' => 'success',
                    'message' => 'Request created successfully',
                    'customer_id' => $request->customer_id,
                    'customer_name' => $customerName,
                    'product_id' => $request->product_id,
                    'product_name' => $productArray['title'],
                    'variant_id' => $request->product_id,
                    'variant_name' =>$variantsArray['title'],
                ];
                return response()->json($response, 200);
            }
            if (empty($productResults)) {
                $productRequest = new ProductRequest();
                $productRequest->product_id = $request->product_id;
                $productRequest->variant_id = $request->variant_id;
                $productRequest->customer_id = $request->customer_id;
                $productRequest->brand = $productArray['vendor'];
                $productRequest->variant_sku = $variantsArray['sku'];
                $productRequest->product_name = $productArray['title'];
                $productRequest->variant_name = $variantsArray['title'];
                $productRequest->image_url = $imageUrl;
                $productRequest->quantity_needed = $request->quantity_needed;
                $productRequest->in_stock = $variantsArray['inventory_quantity'];
                $productRequest->customer_name = $customerName;
                $productRequest->phone = $customerContact;
                $productRequest->back_in_stock = "pending";
                $productRequest->archived = "pending";
                $productRequest->notes = $notes;
                $productRequest->save();

                $response = [
                    'status' => 'success',
                    'message' => 'Request created successfully',
                    'customer_id' => $request->customer_id,
                    'customer_name' => $customerName,
                    'product_id' => $request->product_id,
                    'product_name' => $productArray['title'],
                    'variant_id' => $request->product_id,
                    'variant_name' =>$variantsArray['title'],
                ];
                return response()->json($response, 200);
            } else {            
                
                $response = [
                    'status'    => 'error',
                    'message'   => ['Request already exist for the customer with same product.'],
                ];    
                return response()->json($response, 200);
            }      
           
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create request', 'message' => $e->getMessage()], 500);
        }
    }

    public function getRequestedProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'date',
            'to_date' => 'date'
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
                'Date_format' => 'Date Format Should Be like YEAR-MONTH-DATE'
            ];

            return response()->json($response, 400);
        }

        try {

            if ($request->from_date && $request->to_date) {

                $startDate = Carbon::createFromFormat('Y-m-d', $request->from_date)->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $request->to_date)->endOfDay();
                $results = ProductRequest::whereBetween('created_at', [$startDate, $endDate])->get()->toArray();

                if (empty($results)) {
                    $response = [
                        'status' => 'error',
                        'msg' => 'No Record Found',
                    ];
                    return response()->json($response, 404);
                }
                $response = [
                    'status' => 'success',
                    'data' => $results
                ];
                return response()->json($response, 200);
            }

            if ($request->search_term) {

                $searchTerm = $request->search_term;

                //Search Data in Request Table
                $getProducts = ProductRequest::where(function ($query) {
                    $query->where('back_in_stock', 'pending')
                        ->where('archived', 'pending');
                })->get()->toArray();


                if (empty($getProducts)) {
                    $response = [
                        'status' => 'error',
                        'data' => 'No Record Found'
                    ];
                } else {
                    $results = array_filter($getProducts, function ($product) use ($searchTerm) {
                        return (
                            stripos($product['product_id'], $searchTerm) !== false ||
                            stripos($product['variant_id'], $searchTerm) !== false ||
                            stripos($product['customer_id'], $searchTerm) !== false ||
                            stripos($product['brand'], $searchTerm) !== false ||
                            stripos($product['variant_sku'], $searchTerm) !== false ||
                            stripos($product['product_name'], $searchTerm) !== false ||
                            stripos($product['variant_name'], $searchTerm) !== false ||
                            stripos($product['quantity_needed'], $searchTerm) !== false ||
                            stripos($product['customer_name'], $searchTerm) !== false ||
                            stripos($product['phone'], $searchTerm) !== false
                        );
                    });

                    if (empty($results)) {
                        $response = [
                            'status' => 'error',
                            'data' => 'No Record Found'
                        ];
                        return response()->json($response, 404);
                    } else {
                        $response = [
                            'status' => 'success',
                            'data' => $results
                        ];
                        return response()->json($response, 200);
                    }
                }
            }

            if ($request->order_type && $request->column_name) {

                $data = ProductRequest::orderBy($request->column_name, $request->order_type)->get();
                $response = [
                    'status' => 'success',
                    'data' => $data
                ];
                return response()->json($response, 200);
            }

            $data = ProductRequest::where('back_in_stock', 'pending')
                ->where('archived', 'pending')
                ->orderBy('created_at','desc')
                ->get()
                ->toArray();

            if (!empty($data)) {
                $response = [
                    'status' => 'success',
                    'data' => $data,
                ];
                return response()->json($response, 200);
            } else {
                $response = [
                    'status' => 'error',
                    'data' => 'No Product in Request',
                ];
                return response()->json($response, 404);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to Fetch Requested Product', 'message' => $e->getMessage()], 500);
        }
    }

    public function getBackInStockProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'date',
            'to_date' => 'date'
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
                'Date_format' => 'Date Format Should Be like YEAR-MONTH-DATE'
            ];

            return response()->json($response, 400);
        }

        try {

            if ($request->from_date && $request->to_date) {

                $startDate = Carbon::createFromFormat('Y-m-d', $request->from_date)->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $request->to_date)->endOfDay();
                $results = ProductRequest::whereBetween('created_at', [$startDate, $endDate])->get()->toArray();

                if (empty($results)) {
                    $response = [
                        'status' => 'error',
                        'msg' => 'No Record Found',
                    ];
                    return response()->json($response, 404);
                }
                $response = [
                    'status' => 'success',
                    'data' => $results
                ];
                return response()->json($response, 200);
            }

            if ($request->search_term) {

                $searchTerm = $request->search_term;

                //Search Data in Request Table
                $getProducts = ProductRequest::where(function ($query) {
                    $query->where('back_in_stock', 'active')
                        ->where('archived', 'pending');
                })->get()->toArray();


                if (empty($getProducts)) {
                    $response = [
                        'status' => 'error',
                        'data' => 'No Record Found'
                    ];
                } else {
                    $results = array_filter($getProducts, function ($product) use ($searchTerm) {
                        return (
                            stripos($product['product_id'], $searchTerm) !== false ||
                            stripos($product['variant_id'], $searchTerm) !== false ||
                            stripos($product['customer_id'], $searchTerm) !== false ||
                            stripos($product['brand'], $searchTerm) !== false ||
                            stripos($product['variant_sku'], $searchTerm) !== false ||
                            stripos($product['product_name'], $searchTerm) !== false ||
                            stripos($product['variant_name'], $searchTerm) !== false ||
                            stripos($product['quantity_needed'], $searchTerm) !== false ||
                            stripos($product['customer_name'], $searchTerm) !== false ||
                            stripos($product['phone'], $searchTerm) !== false
                        );
                    });

                    if (empty($results)) {
                        $response = [
                            'status' => 'error',
                            'data' => 'No Record Found'
                        ];
                        return response()->json($response, 404);
                    } else {
                        $response = [
                            'status' => 'success',
                            'data' => $results
                        ];
                        return response()->json($response, 200);
                    }
                }
            }

            if ($request->order_type && $request->column_name) {

                $data = ProductRequest::orderBy($request->column_name, $request->order_type)->get();
                $response = [
                    'status' => 'success',
                    'data' => $data
                ];
                return response()->json($response, 200);
            }

            $data = ProductRequest::where('back_in_stock', 'active')
                ->where('archived', 'pending')
                ->orderBy('updated_at','desc')
                ->get()
                ->toArray();

            if (!empty($data)) {
                $response = [
                    'status' => 'success',
                    'data' => $data,
                ];
                return response()->json($response, 200);
            } else {
                $response = [
                    'status' => 'error',
                    'data' => 'No Product in Back In Stock Table',
                ];
                return response()->json($response, 404);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to Fetch Back In Stock Product', 'message' => $e->getMessage()], 500);
        }
    }   

    public function getArchivedProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'date',
            'to_date' => 'date'
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
                'Date_format' => 'Date Format Should Be like YEAR-MONTH-DATE'
            ];

            return response()->json($response, 400);
        }

        try {

            if ($request->from_date && $request->to_date) {

                $startDate = Carbon::createFromFormat('Y-m-d', $request->from_date)->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $request->to_date)->endOfDay();
                $results = ProductRequest::whereBetween('created_at', [$startDate, $endDate])->get()->toArray();

                if (empty($results)) {
                    $response = [
                        'status' => 'error',
                        'msg' => 'No Record Found',
                    ];
                    return response()->json($response, 404);
                }
                $response = [
                    'status' => 'success',
                    'data' => $results
                ];
                return response()->json($response, 200);
            }

            if ($request->search_term) {

                $searchTerm = $request->search_term;

                //Search Data in Request Table
                $getProducts = ProductRequest::where(function ($query) {
                    $query->where('archived', 'active');
                })->get()->toArray();


                if (empty($getProducts)) {
                    $response = [
                        'status' => 'error',
                        'data' => 'No Record Found'
                    ];
                } else {
                    $results = array_filter($getProducts, function ($product) use ($searchTerm) {
                        return (
                            stripos($product['product_id'], $searchTerm) !== false ||
                            stripos($product['variant_id'], $searchTerm) !== false ||
                            stripos($product['customer_id'], $searchTerm) !== false ||
                            stripos($product['brand'], $searchTerm) !== false ||
                            stripos($product['variant_sku'], $searchTerm) !== false ||
                            stripos($product['product_name'], $searchTerm) !== false ||
                            stripos($product['variant_name'], $searchTerm) !== false ||
                            stripos($product['quantity_needed'], $searchTerm) !== false ||
                            stripos($product['customer_name'], $searchTerm) !== false ||
                            stripos($product['phone'], $searchTerm) !== false
                        );
                    });

                    if (empty($results)) {
                        $response = [
                            'status' => 'error',
                            'data' => 'No Record Found'
                        ];
                        return response()->json($response, 404);
                    } else {
                        $response = [
                            'status' => 'success',
                            'data' => $results
                        ];
                        return response()->json($response, 200);
                    }
                }
            }

            if ($request->order_type && $request->column_name) {

                $data = ProductRequest::orderBy($request->column_name, $request->order_type)->get();
                $response = [
                    'status' => 'success',
                    'data' => $data
                ];
                return response()->json($response, 200);
            }

            $data = ProductRequest::where('archived', 'active')
                ->orderBy('updated_at','desc')
                ->get()
                ->toArray();

            if (!empty($data)) {
                $response = [
                    'status' => 'success',
                    'data' => $data,
                ];
                return response()->json($response, 200);
            } else {
                $response = [
                    'status' => 'error',
                    'data' => 'No Product in Archive Table',
                ];
                return response()->json($response, 404);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to Fetch Archive Products', 'message' => $e->getMessage()], 500);
        }
    }

    public function archiveProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try {
            $data = ProductRequest::where('id', $request->id)->first();

            if ($data == null) {
                $response = [
                    'status' => 'error',
                    'msg' => 'Id Not Found'
                ];
                return response()->json($response, 404);
            }

            $archiveProduct = ProductRequest::where('id', $request->id)->update(['archived' => 'active']);
            $response = [
                'status' => 'success',
                'msg' => 'Product Archived Successfully'
            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to Archive Product', 'message' => $e->getMessage()], 500);
        }
    }

    public function backInStockProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];
            return response()->json($response, 401);
        }

        try {
            $data = ProductRequest::where('id', $request->id)->first();

            if ($data == null) {
                $response = [
                    'status' => 'error',
                    'msg' => 'Id Not Found'
                ];
                return response()->json($response, 404);
            }

            $backInStockProduct = ProductRequest::where('id', $request->id)->update(['back_in_stock' => 'active']);
            $response = [
                'status' => 'success',
                'msg' => 'Product is BackInStock'
            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed in BackIn Stock Product', 'message' => $e->getMessage()], 500);
        }
    }

    public function unarchivedRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try {
            $data = ProductRequest::where('id', $request->id)->first();

            if ($data == null) {
                $response = [
                    'status' => 'error',
                    'msg' => 'Id Not Found'
                ];
                return response()->json($response, 404);
            }

            $unarchiveProduct = ProductRequest::where('id', $request->id)->update(['archived' => 'pending']);
            $response = [
                'status' => 'success',
                'msg' => 'Product Unarchived Successfully'
            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to Unarchive Product', 'message' => $e->getMessage()], 500);
        }
    }

    public function deleteRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try {
            $data = ProductRequest::where('id', $request->id)->first();

            if ($data == null) {
                $response = [
                    'status' => 'error',
                    'msg' => 'Id Not Found'
                ];
                return response()->json($response, 404);
            }

            $deleteProduct = ProductRequest::where('id', $request->id)->delete();
            $response = [
                'status' => 'success',
                'msg' => 'Product Deleted Successfully'
            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to Delete Product', 'message' => $e->getMessage()], 500);
        }
    }

    public function editRequest(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'product_id' => 'integer',
            'variant_id' => 'integer',
            'quantity_needed' => 'integer',
            'customer_name' => 'string',
            'customer_contact' => 'max:14',
            'customer_id' => 'integer',
        ]);

        if ($validator->fails()) {
           $errors = $validator->errors()->all();
            
            $response = [
                'status' => 'error',
                'message' => [$errors],
            ];
            
            return response()->json($response, 401);
        }

        try {
            $data = ProductRequest::where('id', $request->id)->first();

            if (!$data) {
                $response = [
                    'status' => 'error',
                    'msg' => 'Id Not Found'
                ];
                return response()->json($response, 404);
            }

            $productRequest = ProductRequest::find($request->id);

            if (!$productRequest) {
                $response = [
                    'status' => 'error',
                    'msg' => 'No Product Found'
                ];
                return response()->json($response, 404);
            }

            $productData = null;
            $variantData = null;
            $customer = null;

            if ($request->product_id) {
                $productData = ModelsProduct::where('product_id', $request->product_id)->first();
            }

            if ($request->variant_id) {
                $variantData = ModelsVariant::where('variant_id', $request->variant_id)->first();
            }

            if ($request->customer_id) {
                $customer = ModelsCustomer::where('customer_id', $request->customer_id)->first();
            }
            
            $customerName = $request->customer_name ?? $customer->full_name ?? $productRequest->customer_name;
            $customerContact = $request->customer_contact ?? $customer->phone ?? $productRequest->phone;
            $productImage = ModelsProduct::where('product_id',$request->product_id)->first();
            // return $productImage->images;

            $img = json_decode($productImage->images,true);
            
            $variantId = [];
       
        //     $updatedImageUrl = null;
        //     for ($i = 0; $i < count($img); $i++){
        //         if(count($img[$i]['variant_ids']) > 0){
        //             $variantId = $img[$i]['variant_ids'];
        //             if((string)$variantId[0] === $request->variant_id){
        //             $updatedImageUrl = $img[$i]['src'];
        //             }
        //         }
        //         else{
        //             $updatedImageUrl = null;
        //         }
        //    }

           $productDetail = ModelsProduct::where('product_id', $request->product_id)->with('variants')->get()->toArray();
            $variants = $productDetail[0]['variants'];
     
            $imageArray = json_decode($productDetail[0]['images']);
            $imageUrl='';
            foreach($variants as $variant){
                
                if($variant['title'] === 'Default Title' || $variant['title'] === 'Default'){

                    $imageUrl = $imageArray[0]->src;
                }
                else if(count($imageArray[0]->variant_ids) > 0){
                    foreach($imageArray[0]->variant_ids as $variantID){      
                        if($variant['variant_id'] === $variantID){
                            $imageUrl = $imageArray[0]->src;
                        }
                    };
                }else{
                    $imageUrl = $imageArray[0]->src;
                }
            }


            $productRequest->update([
                'product_id' => $request->product_id ?? $productRequest->product_id,
                'variant_id' => $request->variant_id ?? $productRequest->variant_id,
                'customer_id' => $request->customer_id ?? $productRequest->customer_id,
                'brand' => $productRequest->brand,
                'variant_sku' => $variantData ? $variantData->sku :  $productRequest->variant_sku,
                'product_name' => $productData ? $productData->title :  $productRequest->product_name,
                'variant_name' => $variantData ? $variantData->title :  $productRequest->variant_name,
                'quantity_needed' => $request->quantity_needed ?? $productRequest->quantity_needed,
                'customer_name' => $customerName,
                'phone' => $customerContact,
                'back_in_stock' => $productRequest->back_in_stock ?? 'pending',
                'image_url'=> $imageUrl,
                'archived' => $productRequest->archived ?? 'pending',
            ]);

            return response()->json(['success' => 'true', 'message' => 'Product Request updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update Product Request', 'message' => $e->getMessage()], 500);
        }
    }

     public function bulkArchiveProducts(Request $request)
    {
        // dd($request->all());
        $validator = Validator::make($request->all(), [
            'ids' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try {
            $idsArray = json_decode($request->ids);
            foreach ($idsArray as $id) {
                ProductRequest::where('id', $id)->update(['archived' => 'active']);
            }
            return response()->json(['success' => 'true', 'message' => 'Products Archived successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed To Archive Products', 'message' => $e->getMessage()], 500);
        }
    }

    public function bulkUnarchiveProducts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try {
            $idsArray = json_decode($request->ids);
            foreach ($idsArray as $id) {
                ProductRequest::where('id', $id)->update(['archived' => 'pending']);
            }
            return response()->json(['success' => 'true', 'message' => 'Products Unarchived successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed To Unarchive Products', 'message' => $e->getMessage()], 500);
        }
    }

    public function bulkdeleteProducts(Request $request){
        $validator = Validator::make($request->all(), [
            'ids' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try {
            $idsArray = json_decode($request->ids);
            foreach ($idsArray as $id) {
                ProductRequest::where('id', $id)->delete();
            }
            return response()->json(['success' => 'true', 'message' => 'Products Deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed To Delete Products', 'message' => $e->getMessage()], 500);
        }
    }

     public function messageSent(Request $request){
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            $response = [
                'status' => 'error',
                'message' => $validator->errors(),
            ];

            return response()->json($response, 401);
        }
        try{
            ProductRequest::where('id',$request->id)->update(['message_status' => 'active']);
            return response()->json(['success' => 'true', 'message' => 'message-status updated successfully'], 200);
        }
        catch(\Exception $e){
            return response()->json(['error' => 'Failed To Delete Products', 'message' => $e->getMessage()], 500);
        }
    }

    public function excecuteCronJob(){
        try{

            $shop = env('SHOP');
            $path = base_path('artisan');
            $command = "php $path PopulateShopifyData:command $shop> /dev/null 2>&1 &";
            Log::info($command);
            //Job to populate the Shopify Customer In the Database
            exec($command);

            return response()->json(['success' => 'true', 'message' => 'Cron Job Executed successfully'], 200);
        }
        catch(\Exception $e){
            return response()->json(['error' => 'Failed To Execute Crone Job', 'message' => $e->getMessage()], 500);
        }
    }

    public function populateImages(){
        $ids = ProductRequest::where('image_url',null)->pluck('product_id')->toArray();
        foreach($ids as $id){
            $x = ModelsProduct::where('product_id',$id)->pluck('images')->toArray();
            $image = json_decode($x[0]);
            ProductRequest::where('product_id',$id)->update(['image_url' => $image[0]->src]);
        }
        return response()->json(['success' => 'true', 'message' => 'Images Populated successfully'], 200);
    }

    #edit notes
    public function editNotes(Request $request){
        $requestId = $request->id;
        $newNotes = $request->notes; 

        if($requestId && $newNotes){

            try{
                ProductRequest::where('id',$requestId)->update([
                    'notes'=>$newNotes
                ]);
    
                return response()->json(['success' => 'true', 'message' => 'Notes updated successfully'], 200);
            }catch(\Exception $e){
                return response()->json(['status' => 'failure', 'message' => 'Something went wrong','details'=>$e->getMessage()], 500);
            }
            
        }else{
            return response()->json(['status' => 'failure', 'message' => 'Request id and notes fields are required'], 402);
        }
    }
}