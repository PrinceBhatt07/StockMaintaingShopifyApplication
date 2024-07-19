import { useMemo } from "react";

export function useFilteredData(
    rows,
    queryValue,
    sortSelected,
    selectedStatus,
    brand,
    productName,
    variantName,
    customerName,
    phoneNumber,
    variantSku,
    qtyNeeded,
    inStock
) {
    if (rows.length > 0) {
        return useMemo(() => {
            const searchFunction = (item) => {
                const customerNameMatch = (item?.customer_name || "")
                    ?.toLowerCase()
                    ?.includes(queryValue?.toLowerCase());
                const brandMatch = (item?.brand || "")
                    ?.toLowerCase()
                    ?.includes(queryValue);
                const productNameMatch = (item?.product_name || "")
                    ?.toLowerCase()
                    ?.includes(queryValue?.toLowerCase());
                const phoneNumberMatch = (item?.phone || "").includes(
                    queryValue
                );
                const variantNameMatch = (item?.variant_name || "")
                    ?.toLowerCase()
                    ?.includes(queryValue?.toLowerCase());
                const skuMatch = (item?.variant_sku || "")
                    ?.toLowerCase()
                    ?.includes(queryValue?.toLowerCase());
                const qtyMatch = item?.quantity_needed
                    ?.toLowerCase()
                    ?.includes(queryValue?.toLowerCase());
                const stockMatch = item?.in_stock
                    ?.toLowerCase()
                    ?.includes(queryValue?.toLowerCase());
                return (
                    queryValue === "" ||
                    customerNameMatch ||
                    brandMatch ||
                    phoneNumberMatch ||
                    productNameMatch ||
                    skuMatch ||
                    variantNameMatch ||
                    qtyMatch ||
                    stockMatch
                );
            };

            const filterFunction = (item) => {
                const productNameMatch =
                    productName === "" ||
                    item?.product_name
                        ?.toLowerCase()
                        ?.includes(productName?.toLowerCase());
                const variantNameMatch =
                    variantName === "" ||
                    item?.variant_name
                        ?.toLowerCase()
                        ?.includes(variantName?.toLowerCase());
                const brandMatch =
                    brand === "" ||
                    item?.brand
                        ?.toLowerCase()
                        ?.replace(/\s/g, "_")
                        ?.includes(brand);
                const customerNameMatch =
                    customerName === "" ||
                    item?.customer_name
                        ?.toLowerCase()
                        ?.includes(customerName?.toLowerCase());
                const phoneNumberMatch =
                    phoneNumber === "" ||
                    item?.phone
                        ?.toLowerCase()
                        ?.includes(phoneNumber?.toLowerCase());
                const variantSkuMatch =
                    variantSku === "" ||
                    item?.variant_sku
                        ?.toLowerCase()
                        ?.includes(variantSku?.toLowerCase());
                const quantityMatch =
                    qtyNeeded === "" ||
                    item?.quantity_needed
                        ?.toLowerCase()
                        ?.toString()
                        ?.includes(qtyNeeded?.toString());

                const inStockMatch =
                    inStock === "" ||
                    item?.in_stock?.toString()?.includes(inStock?.toString());

                return (
                    productNameMatch &&
                    variantNameMatch &&
                    brandMatch &&
                    customerNameMatch &&
                    phoneNumberMatch &&
                    variantSkuMatch &&
                    quantityMatch &&
                    inStockMatch
                );
            };

            function sortFunction(a, b) {
                if (sortSelected.length > 0) {
                    if (sortSelected[0] == "none") {
                        return 0;
                    }
                    if (sortSelected[0] == "brand asc") {
                        return a?.brand?.localeCompare(b?.brand);
                    }
                    if (sortSelected[0] === "brand desc") {
                        return b?.brand?.localeCompare(a?.brand);
                    }
                    if (sortSelected[0] == "variantsku asc") {
                        return a?.variant_sku?.localeCompare(b?.variant_sku);
                    }
                    if (sortSelected[0] === "variantsku desc") {
                        return b?.variant_sku?.localeCompare(a?.variant_sku);
                    }
                    if (sortSelected[0] == "productname asc") {
                        return a?.product_name?.localeCompare(b?.product_name);
                    }
                    if (sortSelected[0] === "productname desc") {
                        return b?.product_name?.localeCompare(a?.product_name);
                    }
                    if (sortSelected[0] == "variantname asc") {
                        return a?.variant_name?.localeCompare(b?.variant_name);
                    }
                    if (sortSelected[0] === "variantname") {
                        return b?.variant_name?.localeCompare(a?.variant_name);
                    }
                    if (sortSelected[0] == "quantity asc") {
                        return a?.quantity_needed?.localeCompare(
                            b?.quantity_needed
                        );
                    }
                    if (sortSelected[0] === "quantity desc") {
                        return b?.quantity_needed?.localeCompare(
                            a?.quantity_needed
                        );
                    }
                    if (sortSelected[0] == "instock asc") {
                        return a?.in_stock?.localeCompare(b?.in_stock);
                    }
                    if (sortSelected[0] === "instock desc") {
                        return b?.in_stock?.localeCompare(a?.in_stock);
                    }
                    if (sortSelected[0] == "customer asc") {
                        return a?.customer_name?.localeCompare(
                            b?.customer_name
                        );
                    }
                    if (sortSelected[0] === "customer desc") {
                        return b?.customer_name?.localeCompare(
                            a?.customer_name
                        );
                    }
                    if (sortSelected[0] == "phone asc") {
                        return a?.phone?.localeCompare(b?.phone);
                    }
                    if (sortSelected[0] === "phone desc") {
                        return b?.phone?.localeCompare(a?.phone);
                    }
                }
            }

            const statusFunction = (item) => {
                if (selectedStatus !== "all") {
                    const statusMatch = item?.message_status
                        ?.toLowerCase()
                        ?.includes(selectedStatus?.toLowerCase());
                    return selectedStatus === "" || statusMatch;
                } else if (selectedStatus === "all") {
                    return true;
                }
            };
            return rows
                ?.filter(filterFunction)
                ?.sort(sortFunction)
                ?.filter(statusFunction)
                ?.filter(searchFunction);
        }, [
            rows,
            queryValue,
            sortSelected,
            selectedStatus,
            productName,
            variantName,
            brand,
            productName,
            variantName,
            customerName,
            phoneNumber,
            variantSku,
            qtyNeeded,
            inStock,
        ]);
    }
}
