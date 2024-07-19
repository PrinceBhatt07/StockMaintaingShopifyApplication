import {
  Button,
  Frame,
  Modal,
  Icon,
  Layout,
  HorizontalGrid,
  Tooltip,
  Thumbnail,
  Text,
  LegacyCard,
  FormLayout,
  TextField,
  Box,
  Badge,
  Toast,
  Spinner,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { EditMinor } from "@shopify/polaris-icons";
import SelectProductOption from "../components/selectProduct.jsx";
import { API_URL } from "../utils/apiUrls.js";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js";
import DefaultImage from "../assets/Images/defaultImage.svg";

function EditPopup({
  id,
  variant_id,
  customer_name,
  quantity_needed,
  phone,
  product_id,
  product_name,
  image_url,
  variant_name,
  variant_sku,
  getRequestedProducts,
}) {
  const [active, setActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [value, setValue] = useState(quantity_needed);
  const [product, setProduct] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [productsData, setProductsData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const toggleActive = useCallback(
    () => setShowToast((showToast) => !showToast),
    []
  );
  const errorToggle = useCallback(
    () => setShowError((showError) => !showError),
    []
  );
  const errorToggleActive = useCallback(
    () => setShowErrorToast((showErrorToast) => !showErrorToast),
    []
  );
  const [productOptions, setProductOptions] = useState([]);
  const handleQuantChange = useCallback((newValue) => setValue(newValue), []);
  const fetch = useAuthenticatedFetch();

  const handleChange = useCallback(() => {
    setErrorMsg("");
    setActive(!active);
    setNameValue(customer_name);
    setPhoneValue(phone);
    setValue(quantity_needed);
  }, [active, product, productsData]);

  const activator = (
    <Button variant="plain" onClick={handleChange}>
      <Tooltip content="Edit Request">
        <Icon source={EditMinor} tone="base" />
      </Tooltip>
    </Button>
  );
  const [valueName, setNameValue] = useState(customer_name);
  const [valuePhoneNumber, setPhoneValue] = useState(phone);
  const nameHandleChange = useCallback((newValue) => setNameValue(newValue));
  const phoneHandleChange = useCallback((newValue) => {
    if (phone == null && newValue == "") {
      setPhoneValue(null);
    } else {
      setPhoneValue(newValue);
    }
  });
  const getProducts = async () => {
    try {
      const response = await fetch(API_URL.getOutStockProducts);
      const data = await response.json();
      if (data.status == "success") {
        setProduct(data.data);
        let matchedRow;
        const formattedProducts = data?.data?.flatMap((product) =>
          product.variants.map((variant) => {
            if (
              variant.title === "Default Title" ||
              variant.title === "Default"
            ) {
              matchedRow = JSON.parse(product.images)[0];
            } else {
              matchedRow = JSON.parse(product.images).find(
                (row) =>
                  row?.variant_ids?.length > 0 &&
                  row?.variant_ids.find((item) => {
                    return item === variant?.variant_id;
                  })
              );
              if (matchedRow == undefined) {
                matchedRow = JSON.parse(product.images)[0];
              }
            }

            const inventoryMatched = product.variants.find(
              (item) => item.variant_id == variant.variant_id
            );
            return {
              id: variant.variant_id,
              label: product.title + " - " + variant.title,
              value: variant.variant_id,
              variant_sku: variant.sku,
              product_id: product.product_id,
              image_url: matchedRow ? matchedRow.src : null,
              inventory: inventoryMatched
                ? inventoryMatched.inventory_quantity
                : null,
            };
          })
        );

        const uniqueVariantIds = new Set();
        const uniqueFormattedProducts = formattedProducts.filter((product) => {
          if (!uniqueVariantIds.has(product.id)) {
            uniqueVariantIds.add(product.id);
            return true;
          }
          return false;
        });
        setProductOptions(uniqueFormattedProducts);
      } else {
        const formattedOptions = [
          {
            label: "No Products",
            value: 1,
          },
        ];
        setProductOptions(formattedOptions);
      }
    } catch (err) {}
  };

  const handleProductsDataChange = (data) => {
    setProductsData(data);
  };
  const setProductsSelected = () => {
    if (productsData.length == 0) {
      const filteredData = product?.flatMap((item) =>
        item?.variants

          ?.filter((variant) => variant.variant_id === variant_id)
          ?.map((matchedVariant) => {
            const matchedRow = JSON.parse(item.images)?.find(
              (row) =>
                row?.variant_ids?.length > 0 &&
                row?.variant_ids[0] === variant_id
            );
            return {
              product: item,
              variant: matchedVariant,
              image_url: matchedRow?.src,
            };
          })
      );
      const uniqueVariantIds = new Set();
      const uniqueFormattedProducts = filteredData.filter((product) => {
        if (!uniqueVariantIds.has(product?.value)) {
          uniqueVariantIds.add(product?.value);
          return true;
        }
        return false;
      });
      setSelectedProduct(uniqueFormattedProducts[0]);
    } else {
      setSelectedProduct(productsData[0]);
    }
  };

  useEffect(() => {
    setProductsSelected();
  }, [product, productsData]);
  // useEffect(() => {
  //     if (selectedProduct == undefined || null) {
  //         setLoading(true);
  //     } else {
  //         setLoading(false);
  //     }
  // }, [selectedProduct]);

  useEffect(() => {
    if (active) getProducts();
  }, [active]);

  const Validation = () => {
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$/;
    const nameRegex = /[a-zA-Z]/;
    if (value?.trim() === "") {
      return "Please Enter Quantity.";
    } else if (valueName?.trim() === "") {
      return "Please Enter Name.";
    } else if (selectedProduct.variant.inventory_quantity > value) {
      return "Quantity needed should be greater than available quantity";
    } else if (valuePhoneNumber?.trim() === "" && valuePhoneNumber != null) {
      return "Please Enter Phone No.";
    } else if (!nameRegex?.test(valueName)) {
      return "Enter a valid name.";
    } else if (
      !phoneRegex?.test(valuePhoneNumber) &&
      valuePhoneNumber != null
    ) {
      return "Invalid Phone No. Please enter a valid phone number.";
    } else {
      return "Ok";
    }
  };

  const editRequest = async () => {
    let validated = Validation();
    if (validated != "Ok") {
      setIsError(true);
      setErrorMsg(validated);
    } else {
      setIsLoading(true);
      setErrorMsg("");
      const formData = new FormData();
      formData.append(
        "product_id",
        productsData.length > 0
          ? selectedProduct?.product?.product_id
          : product_id
      );
      formData.append(
        "variant_id",
        productsData.length > 0
          ? selectedProduct?.variant?.variant_id
          : variant_id
      );
      formData.append("quantity_needed", value);
      formData.append("customer_name", valueName);
      formData.append(
        "customer_contact",
        valuePhoneNumber === null ? "" : valuePhoneNumber
      );
      try {
        const response = await fetch(`${API_URL.editRequest}?id=${id}`, {
          method: "POST",
          body: formData,
        });
        setIsLoading(false);
        const data = await response.json();
        if (data.success == "true") {
          setIsLoading(false);
          setToastMsg("Edit Successfully");
          toggleActive();
          setTimeout(() => {
            handleChange();
          }, 1500);
          setTimeout(() => {
            getRequestedProducts();
          }, 2000);
        }
        if (data?.status == "error") {
          if (data.message.length === 1) {
            setToastMsg(data.message[0]);
          } else {
            setToastMsg(
              `${data.message
                .map(
                  (error, index) => `There are some errors:(${index}) ${error}`
                )
                .join(", ")}`
            );
          }

          errorToggleActive();
        }
      } catch (err) {
        setIsLoading(false);
        errorToggle();
      }
    }
  };
  return (
    <div className="modalBoxOuter">
      <Frame>
        <Modal
          activator={activator}
          open={active}
          onClose={handleChange}
          title="Edit"
          primaryAction={{
            content: "Confirm",
            loading: isLoading,
            disabled: loading,
            onAction: editRequest,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleChange,
            },
          ]}
        >
          <Modal.Section>
            {!loading ? (
              <div>
                <Layout.Section>
                  <div className="requestInner">
                    <FormLayout>
                      <HorizontalGrid columns={1} gap={"10"} wrap={false}>
                        <SelectProductOption
                          onProductsDataChange={handleProductsDataChange}
                          variant_id={variant_id}
                          products={product}
                          product_name={product_name}
                          variant_name={variant_name}
                          productOptions={productOptions}
                        />
                      </HorizontalGrid>
                      <HorizontalGrid
                        columns={["oneThird", "twoThirds"]}
                        gap={"10"}
                        wrap={false}
                      >
                        <TextField
                          variant="oneThird"
                          label="Quantity"
                          type="number"
                          value={value}
                          onChange={handleQuantChange}
                          autoComplete="off"
                        />
                      </HorizontalGrid>
                    </FormLayout>
                  </div>
                </Layout.Section>
                <Layout.Section>
                  <FormLayout>
                    <HorizontalGrid columns={2} gap="5">
                      <TextField
                        label="Name"
                        value={valueName}
                        onChange={nameHandleChange}
                        autoComplete="off"
                      />
                      <TextField
                        label="Phone Number"
                        value={valuePhoneNumber}
                        onChange={phoneHandleChange}
                        autoComplete="off"
                      />
                    </HorizontalGrid>
                  </FormLayout>
                </Layout.Section>
                <Layout.Section>
                  <HorizontalGrid columns={1} gap="2">
                    <Box></Box>
                    <LegacyCard sectioned>
                      <div className="customProductSection">
                        <div className="brandBox">
                          <Thumbnail
                            source={
                              image_url != undefined || null
                                ? image_url
                                : DefaultImage
                            }
                            alt="image"
                            size="large"
                          />
                        </div>

                        <div>
                          <Text variant="headingMd" as="h4">
                            {product_name + " - " + variant_name}
                          </Text>
                          <Text variant="bodyMd" as="p">
                            SKU:{" "}
                            {variant_sku == "" ? "Not Provided" : variant_sku}
                          </Text>
                          {selectedProduct?.variant?.weight_unit && (
                            <Badge>
                              {selectedProduct?.variant?.weight +
                                "  " +
                                selectedProduct?.variant?.weight_unit}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </LegacyCard>
                  </HorizontalGrid>
                  {isError && (
                    <div
                      style={{
                        display: "flex",
                        alignContent: "center",
                        color: "red",
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}
                </Layout.Section>
              </div>
            ) : (
              <div className="spinner">
                <Spinner />
              </div>
            )}
          </Modal.Section>
        </Modal>
        {showToast && (
          <Toast
            content="Edit Successfully!!"
            onDismiss={toggleActive}
            duration={1500}
          />
        )}
        {showErrorToast && (
          <Toast
            content={toastMsg}
            error
            onDismiss={errorToggleActive}
            duration={1500}
          />
        )}
        {showError && (
          <Toast
            content="Something Went Wrong"
            error
            onDismiss={errorToggle}
            duration={1500}
          />
        )}
      </Frame>
    </div>
  );
}
export default EditPopup;
