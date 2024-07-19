import { Listbox, Combobox, Icon, Thumbnail } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect, useMemo } from "react";
import DefaultImage from "../assets/Images/defaultImage.svg";
function SelectProductOption({
  onProductsDataChange,
  productOptions,
  products,
  variant_id,
  product_name,
  variant_name,
  select,
}) {
  const deselectedOptions = useMemo(() => productOptions, [productOptions]);
  const [selectedOption, setSelectedOption] = useState();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const slicedProducts = productOptions.slice(0, 500);
  const slicedDeselectedProducts = useMemo(
    () => slicedProducts,
    [slicedProducts]
  );
  const [options, setOptions] = useState(slicedDeselectedProducts);
  const updateText = useCallback(
    (value) => {
      setInputValue(value);
      if (!loading) {
        setLoading(true);
      }
      setTimeout(() => {
        if (value === "") {
          setOptions(deselectedOptions);
          setLoading(false);
          return;
        }
        if (deselectedOptions.length > 0) {
          const filterRegex = new RegExp(value, "i");
          const resultOptions = deselectedOptions?.filter(
            (option) =>
              option.label.match(filterRegex) ||
              option.value.toString().includes(value) ||
              option.variant_sku.toString().includes(value) ||
              option.product_id.toString().includes(value)
          );
          setOptions(resultOptions);
          setLoading(false);
        }
      }, 100);
    },
    [deselectedOptions, loading, options]
  );
  const handleFocus = useCallback((val) => {
    setOptions(slicedDeselectedProducts);
    const value = val.target.value;

    setTimeout(() => {
      if (value === "") {
        setOptions(deselectedOptions);

        return;
      }
      if (deselectedOptions.length > 0) {
        const filterRegex = new RegExp(value, "i");
        const resultOptions = deselectedOptions?.filter(
          (option) =>
            option.label.match(filterRegex) ||
            option.value.toString().includes(value) ||
            option.variant_sku.toString().includes(value) ||
            option.product_id.toString().includes(value)
        );
        setOptions(resultOptions);
      }
    }, 100);
  });
  useEffect(() => {
    updateText();
  }, [deselectedOptions]);
  useEffect(() => {
    if (select) {
      setOptions(productOptions);
      setInputValue("");
      setSelectedOption(undefined);
    }
  }, [select]);
  useEffect(() => {
    if (variant_id != undefined) {
      // const product_name = productOptions?.filter(
      //     (item) => item.value === variant_id
      // );
      // setInputValue(product_name[0]?.label);
      setTimeout(() => {
        setInputValue(`${product_name} - ${variant_name}`);
      }, 50);
    }
    const filteredData = products?.flatMap((product) =>
      product.variants

        .filter((variant) => variant.variant_id === variant_id)
        .map((matchedVariant) => {
          let matchedRow;
          if (
            matchedVariant.title === "Default Title" ||
            matchedVariant.title === "Default"
          ) {
            matchedRow = JSON.parse(product.images)[0];
          } else {
            matchedRow = JSON.parse(product.images).find(
              (row) =>
                row?.variant_ids?.length > 0 &&
                row?.variant_ids.find((item) => {
                  return item === matchedVariant?.variant_id;
                })
            );
            if (matchedRow === undefined) {
              matchedRow = JSON.parse(product.images)[0];
            }
          }

          return {
            product: product,
            variant: matchedVariant,
            image_url: matchedRow?.src,
          };
        })
    );
    const uniqueVariantIds = new Set();
    const uniqueFormattedProducts = filteredData.filter((product) => {
      if (!uniqueVariantIds.has(product.value)) {
        uniqueVariantIds.add(product.value);
        return true;
      }
      return false;
    });
    onProductsDataChange(uniqueFormattedProducts);

    const matchedOption = options.find(
      (option) => option?.value === variant_id
    );
    setSelectedOption(variant_id);
    setInputValue((matchedOption && matchedOption.label) || "");
  }, [productOptions, variant_id]);

  const updateSelection = useCallback(
    (selected) => {
      const filteredData = products?.flatMap((product) =>
        product.variants

          .filter((variant) => variant.variant_id === selected)
          .map((matchedVariant) => {
            let matchedRow;
            if (
              matchedVariant.title === "Default Title" ||
              matchedVariant.title === "Default"
            ) {
              matchedRow = JSON.parse(product.images)[0];
            } else {
              matchedRow = JSON.parse(product.images).find(
                (row) =>
                  row?.variant_ids?.length > 0 &&
                  row?.variant_ids.find((item) => {
                    return item === matchedVariant?.variant_id;
                  })
              );
              if (matchedRow === undefined) {
                matchedRow = JSON.parse(product.images)[0];
              }
            }

            return {
              product: product,
              variant: matchedVariant,
              image_url: matchedRow?.src,
            };
          })
      );

      const uniqueVariantIds = new Set();
      const uniqueFormattedProducts = filteredData.filter((product) => {
        if (!uniqueVariantIds.has(product.value)) {
          uniqueVariantIds.add(product.value);
          return true;
        }
        return false;
      });
      onProductsDataChange(uniqueFormattedProducts);

      const matchedOption = options.find(
        (option) => option?.value === selected
      );
      setSelectedOption(selected);
      setInputValue((matchedOption && matchedOption.label) || "");
    },
    [options]
  );

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          const { label, value, image_url, inventory } = option;

          return (
            <Listbox.Option
              key={`${value}`}
              value={value}
              selected={selectedOption === value}
              accessibilityLabel={label}
            >
              <div className="selectProduct">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <Thumbnail
                    source={image_url != null || "" ? image_url : DefaultImage}
                    alt="image"
                    size="small"
                  />

                  {label}
                </div>
                <div className="inventory">{inventory}</div>
              </div>
            </Listbox.Option>
          );
        })
      : null;

  const loadingMarkup = loading ? (
    <Listbox.Loading accessibilityLabel="Loading" />
  ) : null;
  const listboxMarkup =
    optionsMarkup || loadingMarkup ? (
      <Listbox onSelect={updateSelection}>
        {optionsMarkup && !loading ? optionsMarkup : null}
        {loadingMarkup}
      </Listbox>
    ) : null;
  return (
    <div style={{ marginBottom: "5px" }}>
      <Combobox
        activator={
          <Combobox.TextField
            prefix={<Icon source={SearchMinor} />}
            onChange={updateText}
            onFocus={handleFocus}
            label="Search Products"
            labelHidden
            value={inputValue}
            placeholder="Search Product"
            autoComplete="off"
          />
        }
      >
        {listboxMarkup}
      </Combobox>
    </div>
  );
}

export default SelectProductOption;
