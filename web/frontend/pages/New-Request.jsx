import React from "react";
import {
  Text,
  Page,
  Layout,
  LegacyCard,
  FormLayout,
  TextField,
  VerticalStack,
  Box,
  Toast,
  Frame,
  Thumbnail,
  ButtonGroup,
  Button,
  HorizontalGrid,
  Badge,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import SelectProductOption from "../components/selectProduct.jsx";
import CustomerDetail from "../components/customerDetail.jsx";
import PersonalInfo from "../components/PersonalInfo.jsx";
import { API_URL } from "../utils/apiUrls.js";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js";
import DefaultImage from "../assets/Images/defaultImage.svg";
export default function NewRequests() {
  const [value, setValue] = useState("1");
  const [notes, setNotes] = useState("");
  const [valueName, setNameValue] = useState("");
  const [valuePhoneNumber, setPhoneValue] = useState("");
  const [select, setSelect] = useState(false);
  const handleChange = useCallback((newValue) => setValue(newValue), []);
  const handleNotesChange = useCallback((newValue) => setNotes(newValue), []);
  const [activeButtonIndex, setActiveButtonIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [personal_info, setPersonalInfo] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [product, setProduct] = useState([]);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(false);
  const [isError, setIsError] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fetch = useAuthenticatedFetch();
  const [showError, setShowError] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const errorToggle = useCallback(
    () => setShowError((showError) => !showError),
    []
  );
  const errorToggleActive = useCallback(
    () => setShowErrorToast((showErrorToast) => !showErrorToast),
    []
  );
  const handleButtonClick = (val) => {
    if (val == 1) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setActiveButtonIndex(val);
  };
  const nameHandleChange = useCallback((newValue) => setNameValue(newValue));
  const phoneHandleChange = useCallback((newValue) => setPhoneValue(newValue));
  const handleCustomerDataChange = (data) => {
    setCustomerData(data);
  };

  const handleProductsDataChange = (data) => {
    setSelect(false);
    setProductsData(data);
  };

  const Validation = () => {
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$/;
    const nameRegex = /[a-zA-Z]/;
    if (productsData?.length === 0) {
      return "Product is required.";
    } else if (value?.trim() === "") {
      return "Quantity is required.";
    } else if (selectedProduct.variant.inventory_quantity > value) {
      return "Quantity needed should be greater than available quantity";
    } else if (activeButtonIndex === 0 && !customerData?.customer_id) {
      return "Customer is required.";
    } else if (
      activeButtonIndex === 1 &&
      (valueName?.trim() === "" || valuePhoneNumber?.trim() === "")
    ) {
      return "Customer Name and Phone No. is required.";
    } else if (activeButtonIndex === 1 && !phoneRegex.test(valuePhoneNumber)) {
      return "Invalid Phone No. Please enter a valid phone number.";
    } else if (activeButtonIndex === 1 && !nameRegex.test(valueName)) {
      return "Enter a valid name.";
    } else {
      return "Ok";
    }
  };
  useEffect(() => {
    if (productsData.length == 0) {
      setShow(true);
    } else {
      setSelectedProduct(productsData[0]);
      setShow(false);
    }
  }, [product, productsData]);

  const [options, setOptions] = useState([]);
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

  const getCustomers = async () => {
    try {
      const response = await fetch(API_URL.getCustomers);
      const data = await response.json();
      if (data.status == "success") {
        setPersonalInfo(data.data);
        const formattedOptions = data?.data?.map((customer) => ({
          label: `${customer?.first_name} ${customer?.last_name}`,
          value: customer?.customer_id,
          email: customer?.email,
          phone: customer?.phone,
        }));
        setOptions(formattedOptions);
      } else {
        const formattedOptions = [
          {
            label: "No customers",
            value: 1,
          },
        ];
        setOptions(formattedOptions);
      }
    } catch (err) {}
  };
  useEffect(() => {
    getCustomers();
    getProducts();
  }, []);

  const addRequest = async () => {
    let validated = Validation();
    if (validated != "Ok") {
      setIsError(true);
      setErrorMsg(validated);
    } else {
      setIsError(false);
      setIsLoading(true);
      const formData = new FormData();
      formData.append("product_id", productsData[0]?.product?.product_id);
      formData.append("variant_id", productsData[0]?.variant?.variant_id);
      formData.append("quantity_needed", value);
      formData.append("notes", notes);
      formData.append(
        "customer_id",
        activeButtonIndex === 0 ? customerData?.customer_id : ""
      );
      formData.append(
        "customer_name",
        activeButtonIndex === 1 ? valueName : ""
      );
      formData.append(
        "customer_contact",
        activeButtonIndex === 1 ? valuePhoneNumber : ""
      );

      try {
        const response = await fetch(API_URL.addRequest, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.status == "success") {
          setIsLoading(false);
          toggleActive();

          setTimeout(() => {
            setProductsData([]);
            setSelect(true);
            setCustomerData([]);
            setSelectedProduct([]);
            setNameValue("");
            setPhoneValue("");
            setValue("1");
            setNotes("");
          }, 1000);
        }
        if (data?.status == "error") {
          setIsLoading(false);
          if (data?.message?.length === 1) {
            setToastMsg(data?.message[0]);
          } else {
            setToastMsg(
              `${data?.message
                ?.map(
                  (error, index) => `There are some errors:(${index}) ${error}`
                )
                .join(", ")}`
            );
          }

          errorToggleActive();
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
        errorToggle();
      }
    }
  };
  return (
    <Frame>
      <Page fullWidth>
        <div className="mainRequest">
          <div className="Titlebar">
            <Layout.Section>
              <Box paddingBlockStart="200" maxWidth="300px" width="100%">
                <VerticalStack gap={"100"}>
                  <Text variant="headingXl" as="h2">
                    Add Request
                  </Text>
                </VerticalStack>
              </Box>
            </Layout.Section>
          </div>
          <div className="CustomNewRequest">
            <div className="">
              <Layout.Section>
                <div className="requestInner">
                  <HorizontalGrid
                    columns={["oneThird", "twoThirds"]}
                    gap={"2"}
                    wrap={true}
                  >
                    <Box paddingBlockStart="200" maxWidth="300px" width="100%">
                      <VerticalStack gap={"100"}>
                        <Text variant="headingLg" as="h4">
                          Select Product
                        </Text>
                        <Text variant="bodyLg" as="p" tone="subdued">
                          You can select the products and their quantity from
                          the store to request Availability for the product.
                        </Text>
                      </VerticalStack>
                    </Box>
                    <LegacyCard sectioned>
                      <FormLayout>
                        <HorizontalGrid columns={1} gap={"10"} wrap={false}>
                          <SelectProductOption
                            select={select}
                            onProductsDataChange={handleProductsDataChange}
                            products={product}
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
                            onChange={handleChange}
                            autoComplete="off"
                          />
                        </HorizontalGrid>
                      </FormLayout>
                    </LegacyCard>
                  </HorizontalGrid>
                </div>
              </Layout.Section>
              <Layout.Section>
                <HorizontalGrid
                  columns={["oneThird", "twoThirds"]}
                  gap={"2"}
                  wrap={true}
                >
                  <Box paddingBlockStart="200" maxWidth="300px" width="100%">
                    <VerticalStack gap={"100"}>
                      <Text variant="headingLg" as="h4">
                        Customer Type
                      </Text>
                    </VerticalStack>
                  </Box>
                  <PersonalInfo
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    select={select}
                    personal_info={personal_info}
                    customerOptions={options}
                    handleButtonClick={handleButtonClick}
                    activeButtonIndex={activeButtonIndex}
                    onCustomerDataChange={handleCustomerDataChange}
                  ></PersonalInfo>
                </HorizontalGrid>
              </Layout.Section>

              {isOpen && (
                <Layout.Section>
                  <HorizontalGrid
                    columns={["oneThird", "twoThirds"]}
                    gap={"2"}
                    wrap={true}
                  >
                    <Box paddingBlockStart="200" maxWidth="300px" width="100%">
                      <VerticalStack gap={"100"}>
                        <Text variant="headingLg" as="h4">
                          Personal Information
                        </Text>
                      </VerticalStack>
                    </Box>

                    <LegacyCard sectioned>
                      <FormLayout>
                        <HorizontalGrid columns={2} gap="5">
                          <TextField
                            label="Name"
                            value={valueName}
                            placeholder="Name"
                            onChange={nameHandleChange}
                            autoComplete="off"
                          />
                          <TextField
                            label="Phone Number"
                            placeholder="Phone Number"
                            value={valuePhoneNumber}
                            onChange={phoneHandleChange}
                            autoComplete="off"
                          />
                        </HorizontalGrid>
                      </FormLayout>
                    </LegacyCard>
                  </HorizontalGrid>
                </Layout.Section>
              )}
              <Layout.Section>
                <HorizontalGrid
                  columns={["oneThird", "twoThirds"]}
                  gap={"2"}
                  wrap={true}
                >
                  <Box paddingBlockStart="200" maxWidth="300px" width="100%">
                    <VerticalStack gap={"100"}>
                      <Text variant="headingLg" as="h4">
                        Notes
                      </Text>
                    </VerticalStack>
                  </Box>
                  <LegacyCard padding={"200"} sectioned={"true"}>
                    <TextField
                      labelHidden
                      placeholder="Enter Notes"
                      label="Notes"
                      value={notes}
                      onChange={handleNotesChange}
                      multiline={4}
                      autoComplete="off"
                    />
                  </LegacyCard>
                </HorizontalGrid>
              </Layout.Section>
              <Layout.Section>
                <HorizontalGrid columns={["oneThird", "twoThirds"]} gap="2">
                  <Box
                    paddingBlockStart="200"
                    maxWidth="300px"
                    width="100%"
                  ></Box>

                  {show ? null : (
                    <LegacyCard sectioned>
                      <div className="customProductSection">
                        <div className="brandBox">
                          <Thumbnail
                            source={
                              selectedProduct?.image_url != undefined || null
                                ? selectedProduct?.image_url
                                : DefaultImage
                            }
                            alt="image"
                            size="large"
                          />
                        </div>

                        <div>
                          <Text variant="headingMd" as="h4">
                            {selectedProduct?.product?.title +
                              " - " +
                              selectedProduct?.variant?.title}
                          </Text>
                          <Text variant="bodyMd" as="p">
                            SKU:{" "}
                            {selectedProduct?.variant?.sku == ""
                              ? "Not Provided"
                              : selectedProduct?.variant?.sku}
                          </Text>
                          <Badge>
                            {selectedProduct?.variant?.weight +
                              "  " +
                              selectedProduct?.variant?.weight_unit}
                          </Badge>
                        </div>
                      </div>
                    </LegacyCard>
                  )}
                </HorizontalGrid>
                {isError && (
                  <HorizontalGrid columns={["oneThird", "twoThirds"]} gap="2">
                    <Box></Box>

                    <div
                      style={{
                        display: "flex",
                        alignContent: "center",
                        color: "red",
                        paddingTop: "1rem",
                      }}
                    >
                      {errorMsg}
                    </div>
                  </HorizontalGrid>
                )}
                <div className="requestActions">
                  <HorizontalGrid columns={1} gap="5">
                    <Box width="100%">
                      <ButtonGroup>
                        <Button
                          loading={isLoading}
                          variant="primary"
                          onClick={() => {
                            addRequest();
                          }}
                        >
                          Save Request
                        </Button>
                      </ButtonGroup>
                    </Box>
                  </HorizontalGrid>
                </div>
              </Layout.Section>
            </div>
            {!isOpen && (
              <div className="">
                <CustomerDetail
                  personal_info={personal_info}
                  customerData={customerData}
                />
              </div>
            )}
          </div>
        </div>
        {active && (
          <Toast
            content="Request Added Successfully!!"
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
      </Page>
    </Frame>
  );
}
