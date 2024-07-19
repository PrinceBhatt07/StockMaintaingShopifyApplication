const today = new Date(new Date().setHours(0, 0, 0, 0));
const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
);
export const ranges = [
    {
        title: "Today",
        alias: "today",
        period: {
            since: today,
            until: today,
        },
    },
    {
        title: "Yesterday",
        alias: "yesterday",
        period: {
            since: yesterday,
            until: yesterday,
        },
    },
    {
        title: "Last 7 days",
        alias: "last7days",
        period: {
            since: new Date(
                new Date(new Date().setDate(today.getDate() - 7)).setHours(
                    0,
                    0,
                    0,
                    0
                )
            ),
            until: yesterday,
        },
    },
    {
        title: "Last 30 days",
        alias: "last30days",
        period: {
            since: new Date(
                new Date(new Date().setDate(today.getDate() - 30)).setHours(
                    0,
                    0,
                    0,
                    0
                )
            ),
            until: yesterday,
        },
    },
    {
        title: "Last 90 days",
        alias: "last90days",
        period: {
            since: new Date(
                new Date(new Date().setDate(today.getDate() - 90)).setHours(
                    0,
                    0,
                    0,
                    0
                )
            ),
            until: yesterday,
        },
    },
];

export const sortOptions = [
    {
        label: "none",
        value: "none",
        directionLabel: "Descending",
    },
    {
        label: "none",
        value: "none",
        directionLabel: "Ascending",
    },
    { label: "Brand", value: "brand asc", directionLabel: "Ascending" },
    { label: "Brand", value: "brand desc", directionLabel: "Descending" },
    {
        label: "Variant SKU",
        value: "variantsku asc",
        directionLabel: "Ascending",
    },
    {
        label: "Variant SKU",
        value: "variantsku desc",
        directionLabel: "Descending",
    },
    {
        label: "Product Name",
        value: "productname asc",
        directionLabel: "A-Z",
    },
    {
        label: "Product Name",
        value: "productname desc",
        directionLabel: "Z-A",
    },
    {
        label: "Variant Name",
        value: "variantname asc",
        directionLabel: "A-Z",
    },
    {
        label: "Variant Name",
        value: "variantname desc",
        directionLabel: "Z-A",
    },
    {
        label: "Quantity",
        value: "quantity asc",
        directionLabel: "Ascending",
    },
    {
        label: "Quantity",
        value: "quantity desc",
        directionLabel: "Descending",
    },
    {
        label: "In Stock",
        value: "instock asc",
        directionLabel: "Ascending",
    },
    {
        label: "In Stock",
        value: "instock desc",
        directionLabel: "Descending",
    },
    {
        label: "Customer Name",
        value: "customer asc",
        directionLabel: "A-Z",
    },
    {
        label: "Customer Name",
        value: "customer desc",
        directionLabel: "Z-A",
    },
    { label: "Phone Number", value: "phone asc", directionLabel: "A-Z" },
    { label: "Phone Number", value: "phone desc", directionLabel: "Z-A" },
];
