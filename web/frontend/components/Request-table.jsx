import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  Pagination,
  Box,
  HorizontalStack,
  Thumbnail,
  Toast,
  Frame,
  Spinner,
  Icon,
  Tooltip,
  ChoiceList,
  TextField,
} from "@shopify/polaris";
import {
  StatusActiveMajor,
  SendMajor,
  NoteMajor,
} from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";
import ArcheivePopup from "../components/archeivePopup";
import EditPopup from "../components/editPopup";
import DeletePopup from "../components/DeletePopup";
import { useFilteredData, usePagination } from "../hooks";
import { API_URL } from "../utils/apiUrls";
import { sortOptions } from "../utils/constants";
import { useAuthenticatedFetch } from "../hooks";
import DefaultImage from "../assets/Images/defaultImage.svg";
import NotesModal from "./NotesModal";

function RequestTable({
  deleteHide,
  rows,
  getRequestedProducts,
  getArchivedProducts,
  getAvaialableProducts,
}) {
  const [sortSelected, setSortSelected] = useState(["none"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToastArchived, setShowToastArchieved] = useState(false);
  const [showToastUnarchieved, setShowToastUnarchieved] = useState(false);
  const [showToastDelete, setShowToastDelete] = useState(false);
  const [showToastStatus, setShowToastStatus] = useState(false);
  const [totalPages, setTotalPages] = useState();
  const [showError, setShowError] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState([]);
  const [filteredResouces, setFilteredResources] = useState([]);
  const [selected, setSelected] = useState(0);
  const [brand, setBrand] = useState([]);
  const [Notes, setNotes] = useState({
    note: "",
    id: 0,
  });
  const [notesModalActive, setNotesModalActive] = useState(false);

  const handleNotesModalChange = useCallback(
    () => setNotesModalActive(!notesModalActive),
    [notesModalActive]
  );
  const [productName, setProductName] = useState("");
  const [variantName, setVariantName] = useState("");
  const [inStock, setInStock] = useState("");
  const [qtyNeeded, setQtyNeeded] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const PageSize = 24;

  const fetch = useAuthenticatedFetch();
  const { mode, setMode } = useSetIndexFiltersMode();
  const [queryValue, setQueryValue] = useState("");

  const handleDelete = useCallback(
    () => setDeletePopupOpen(!isDeletePopupOpen),
    [isDeletePopupOpen]
  );
  const errorToggle = useCallback(
    () => setShowError((showError) => !showError),
    []
  );
  const toggleActiveArchieved = useCallback(
    () => setShowToastArchieved((showToastArchived) => !showToastArchived),
    []
  );
  const toggleActiveUnarchieved = useCallback(
    () =>
      setShowToastUnarchieved((showToastUnarchieved) => !showToastUnarchieved),
    []
  );
  const toggleActiveDelete = useCallback(
    () => setShowToastDelete((showToastDelete) => !showToastDelete),
    []
  );
  const toggleActiveStatus = useCallback(
    () => setShowToastStatus((showToastStatus) => !showToastStatus),
    []
  );
  const handleQueryValueRemove = useCallback(() => {
    setQueryValue("");
  }, [currentPage]);
  const handleBrandChange = useCallback((value) => setBrand(value), []);

  const handleProductNameChange = useCallback(
    (value) => setProductName(value),
    []
  );
  const handleVariantNameChange = useCallback(
    (value) => setVariantName(value),
    []
  );
  const handleVariantSkuChange = useCallback(
    (value) => setVariantSku(value),
    []
  );
  const handleCustomerNameChange = useCallback(
    (value) => setCustomerName(value),
    []
  );
  const handlePhoneNumberChange = useCallback(
    (value) => setPhoneNumber(value),
    []
  );
  const handleInStockChange = useCallback((value) => setInStock(value), []);
  const handleQuantityChange = useCallback((value) => setQtyNeeded(value), []);
  const handleBrandRemove = useCallback(() => setBrand([]), []);

  const handleProductNameRemove = useCallback(() => setProductName(""), []);
  const handleVariantNameRemove = useCallback(() => setVariantName(""), []);
  const handleVariantSkuRemove = useCallback(() => setVariantSku(""), []);
  const handleCustomerNameRemove = useCallback(() => setCustomerName(""), []);
  const handlePhoneNumberRemove = useCallback(() => setPhoneNumber(""), []);
  const handleInStockRemove = useCallback(() => setInStock(""), []);
  const handleQuantityRemove = useCallback(() => setQtyNeeded(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleBrandRemove();
    handleProductNameRemove();
    handleVariantNameRemove();
    handleVariantSkuRemove();
    handleCustomerNameRemove();
    handleInStockRemove();
    handleQuantityRemove();
    handlePhoneNumberRemove();
    handleQueryValueRemove();
  }, [
    handleBrandRemove,
    handleProductNameRemove,
    handleVariantNameRemove,
    handleVariantSkuRemove,
    handleCustomerNameRemove,
    handleInStockRemove,
    handlePhoneNumberRemove,
    handleQuantityRemove,
    handleQueryValueRemove,
  ]);

  let choices = Array.from(new Set(rows.map((product) => product.brand))).map(
    (brand) => ({
      label: brand,
      value: brand.toLowerCase().replace(/\s/g, "_"),
    })
  );

  const itemStrings = ["All", "Sent", "Mark As Sent"];
  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {
      setSelectedStatus((prevStatus) => {
        let newStatus;
        if (index === 0) {
          newStatus = "all";
        } else if (index === 1) {
          newStatus = "active";
        } else {
          newStatus = "pending";
        }
        setCurrentPage(1);
        if (newStatus !== "all") {
          const filteredRows = rows?.filter((item) => {
            return item?.message_status
              ?.toLowerCase()
              ?.includes(newStatus?.toLowerCase());
          });
          const totalPagesRounded = Math.ceil(filteredRows.length / PageSize);
          if (totalPagesRounded === 0) {
            setTotalPages(1);
            setCurrentPage(1);
          } else {
            setTotalPages(totalPagesRounded);
            setCurrentPage(1);
          }
        } else {
          const totalPagesRounded = Math.ceil(rows?.length / PageSize);
          if (totalPagesRounded === 0) {
            setTotalPages(1);
          } else {
            setTotalPages(Math.ceil(rows?.length / PageSize));
          }
        }

        return newStatus;
      });
    },

    id: `${item}-${index}`,
    isLocked: index === 0,
  }));
  const handleFiltersQueryChange = useCallback(
    (value) => {
      setQueryValue(value);

      let filteredRows = rows.filter(
        (item) =>
          item.product_name?.toLowerCase()?.includes(value.toLowerCase()) ||
          item.customer_name?.toLowerCase()?.includes(value.toLowerCase()) ||
          item.brand?.toLowerCase()?.includes(value.toLowerCase()) ||
          item.phone?.toLowerCase()?.includes(value.toLowerCase()) ||
          item.variant_name?.toLowerCase()?.includes(value.toLowerCase()) ||
          item.variant_sku?.toLowerCase()?.includes(value.toLowerCase())
      );
      const totalPagesRounded = Math.ceil(filteredRows.length / PageSize);
      if (totalPagesRounded === 0) {
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setTotalPages(totalPagesRounded);
        setCurrentPage(1);
      }
    },
    [rows, PageSize, currentPage, totalPages]
  );

  const filterdData = useFilteredData(
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
  );
  const pagination = usePagination(filterdData, PageSize);
  const bulkArchieve = async () => {
    setIsLoading(true);
    const ids = window.location.href.includes("availability")
      ? [...filteredResouces]
      : [...selectedResources];
    const body = {
      ids: JSON.stringify(ids),
    };
    try {
      const response = await fetch(API_URL.bulkArchieve, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setIsLoading(false);
      if (data.success == "true") {
        toggleActiveArchieved();
        setTimeout(() => {
          if (window.location.href.includes("availability")) {
            getAvaialableProducts();
          } else {
            getRequestedProducts();
          }
        }, [1000]);
      } else {
        errorToggle();
      }
    } catch (err) {
      errorToggle();
      setIsLoading(false);
    }
  };
  const bulkUnarchieve = async () => {
    setIsLoading(true);
    const ids = window.location.href.includes("availability")
      ? [...filteredResouces]
      : [...selectedResources];
    const body = {
      ids: JSON.stringify(ids),
    };
    try {
      const response = await fetch(API_URL.bulkUnarchieve, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setIsLoading(false);
      if (data.success == "true") {
        toggleActiveUnarchieved();
        setTimeout(() => {
          getArchivedProducts();
        }, [1000]);
      } else {
        errorToggle();
      }
    } catch (err) {
      setIsLoading(false);
      errorToggle();
    }
  };
  const bulkDelete = async () => {
    setLoading(true);
    const ids = window.location.href.includes("availability")
      ? [...filteredResouces]
      : [...selectedResources];
    const body = {
      ids: JSON.stringify(ids),
    };
    try {
      const response = await fetch(API_URL.bulkDelete, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setLoading(false);
      if (data.success == "true") {
        toggleActiveDelete();
        setTimeout(() => {
          getArchivedProducts();
        }, [1000]);
      } else {
        errorToggle();
      }
    } catch (err) {
      setLoading(false);
      errorToggle();
    }
  };

  const messageSent = async (id) => {
    const body = {
      id: id,
    };
    try {
      const response = await fetch(API_URL.messageSent, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (
        data.success == "true" &&
        window.location.href.includes("archieved")
      ) {
        getArchivedProducts();
      } else if (
        data.success == "true" &&
        window.location.href.includes("availability")
      ) {
        getAvaialableProducts();
      } else {
        getRequestedProducts();
      }
    } catch (err) {}
  };

  useEffect(() => {
    const totalPagesRounded = Math.ceil(rows?.length / PageSize);
    if (totalPagesRounded === 0) {
      setTotalPages(1);
    } else {
      setTotalPages(Math.ceil(rows?.length / PageSize));
    }
  }, [PageSize, rows]);
  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const handlePrevious = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };
  const resourceName = {
    singular: "row",
    plural: "rows",
  };
  const promotedBulkActions = [];

  if (window.location.href.includes("archieved")) {
    promotedBulkActions.push({
      content: isLoading ? (
        <div style={{ width: "66px" }}>
          <Spinner size="small"></Spinner>
        </div>
      ) : (
        "Unarchive"
      ),
      onAction: () => bulkUnarchieve(),
    });
    promotedBulkActions.push({
      content: "Delete",
      onAction: () => {
        handleDelete();
      },
    });
  } else {
    promotedBulkActions.push({
      content: isLoading ? (
        <div style={{ width: "50px" }}>
          <Spinner size="small"></Spinner>
        </div>
      ) : (
        "Archive"
      ),
      onAction: () => bulkArchieve(),
    });
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(pagination.currentPageData);
  useEffect(() => {
    const filteredIds = pagination.currentPageData
      .filter((item) => item.message_status === "active")
      .map((item) => item.id);
    const filteredArray = filteredIds.filter((id) =>
      selectedResources.includes(id)
    );
    setFilteredResources(filteredArray);

    const filteredIdS = pagination.currentPageData
      .filter((item) => item.message_status === "pending")
      .map((item) => item.id);
    let filteredArrayy = filteredIdS.filter((id) => filteredIdS.includes(id));
    setPendingStatus(filteredArrayy);
  }, [selectedResources]);
  const rowMarkup = pagination.currentPageData?.map(
    (
      {
        id,
        brand,
        variant_sku,
        product_name,
        variant_name,
        created_at,
        customer_name,
        quantity_needed,
        variant_id,
        in_stock,
        image_url,
        phone,
        product_id,
        message_status,
        notes,
      },
      index
    ) => {
      const dateObject = new Date(created_at);
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const formattedDate = dateObject.toLocaleDateString("en-GB", options);
      const handleRowClick = () => {
        console.log(`${id}`);
      };
      return (
        <IndexTable.Row
          id={id}
          key={id}
          selected={
            window.location.href.includes("availability")
              ? filteredResouces.includes(id)
              : selectedResources.includes(id)
          }
          position={index}
          onClick={handleRowClick}
          disabled={
            window.location.href.includes("availability")
              ? message_status == "active"
                ? false
                : true
              : false
          }
        >
          {window.location.href.includes("availability") &&
          message_status == "pending" ? (
            <Tooltip content="Only sent messages rows can be selected">
              <div className="table_date">
                <IndexTable.Cell>{formattedDate}</IndexTable.Cell>
              </div>
            </Tooltip>
          ) : (
            <IndexTable.Cell>{formattedDate}</IndexTable.Cell>
          )}
          <IndexTable.Cell>
            <div className="brandBox">
              <Thumbnail
                source={image_url == null || "" ? DefaultImage : image_url}
                alt={image_url}
                size="small"
              />
              {brand}
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text variant="bodyMd">{variant_sku}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{product_name}</IndexTable.Cell>
          <IndexTable.Cell>{variant_name}</IndexTable.Cell>
          <IndexTable.Cell>{quantity_needed}</IndexTable.Cell>
          <IndexTable.Cell>{in_stock === null ? 0 : in_stock}</IndexTable.Cell>
          <IndexTable.Cell>{customer_name}</IndexTable.Cell>
          <IndexTable.Cell>{phone}</IndexTable.Cell>
          <IndexTable.Cell>
            <div
              onClick={() => {
                handleNotesModalChange();
                setNotes({
                  note: notes,
                  id: id,
                });
              }}
            >
              <Icon source={NoteMajor} />
            </div>
          </IndexTable.Cell>
          {window.location.href.includes("availability") && (
            <IndexTable.Cell>
              {message_status === "pending" ? (
                <div onClick={() => messageSent(id)}>
                  <Tooltip content="Mark as Send">
                    <Icon source={SendMajor} color="subdued" />
                  </Tooltip>
                </div>
              ) : (
                <div>
                  <Tooltip content="Sent">
                    <Icon source={StatusActiveMajor} color="success" />
                  </Tooltip>
                </div>
              )}
            </IndexTable.Cell>
          )}
          <IndexTable.Cell>
            <div className="tableIconBox">
              {deleteHide && (
                <EditPopup
                  id={id}
                  variant_id={variant_id}
                  phone={phone}
                  image_url={image_url}
                  product_name={product_name}
                  customer_name={customer_name}
                  quantity_needed={quantity_needed}
                  variant_sku={variant_sku}
                  variant_name={variant_name}
                  product_id={product_id}
                  getRequestedProducts={getRequestedProducts}
                />
              )}
              {window.location.href.includes("archieved") ? (
                <ArcheivePopup
                  id={id}
                  archieved={true}
                  getRequestedProducts={getArchivedProducts}
                  message_status={message_status}
                />
              ) : window.location.href.includes("availability") ? (
                <ArcheivePopup
                  id={id}
                  archieved={false}
                  getRequestedProducts={getAvaialableProducts}
                  message_status={message_status}
                />
              ) : (
                <ArcheivePopup
                  id={id}
                  archieved={false}
                  getRequestedProducts={getRequestedProducts}
                  message_status={message_status}
                />
              )}
              {!deleteHide && (
                <DeletePopup
                  id={id}
                  getArchivedProducts={getArchivedProducts}
                />
              )}
            </div>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  const filters = [
    {
      key: "brand",
      label: "Brand",
      filter: (
        <ChoiceList
          title="Brand"
          titleHidden
          choices={choices}
          selected={brand || []}
          onChange={handleBrandChange}
        />
      ),
      shortcut: true,
    },
    {
      key: "variantSku",
      label: "Variant SKU",
      filter: (
        <TextField
          label="Variant SKU"
          value={variantSku}
          onChange={handleVariantSkuChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "productName",
      label: "Product Name",
      filter: (
        <TextField
          label="Product Name"
          value={productName}
          onChange={handleProductNameChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "variantName",
      label: "Variant Name",
      filter: (
        <TextField
          label="Product Name"
          value={variantName}
          onChange={handleVariantNameChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "customerName",
      label: "Customer Name",
      filter: (
        <TextField
          label="Customer Name"
          value={customerName}
          onChange={handleCustomerNameChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "quantity",
      label: "Quantity Needed",
      filter: (
        <TextField
          label="Quantity Needed"
          value={qtyNeeded}
          onChange={handleQuantityChange}
          autoComplete="off"
          labelHidden
        />
      ),
    },
    {
      key: "inStock",
      label: "In Stock",
      filter: (
        <TextField
          label="In Stock"
          value={inStock}
          onChange={handleInStockChange}
          autoComplete="off"
          labelHidden
        />
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      filter: (
        <TextField
          label="Phone number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (brand && !isEmpty(brand)) {
    const key = "brand";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, brand),
      onRemove: handleBrandRemove,
    });
  }
  if (!isEmpty(productName)) {
    const key = "productName";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, productName),
      onRemove: handleProductNameRemove,
    });
  }
  if (!isEmpty(variantName)) {
    const key = "variantName";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, variantName),
      onRemove: handleVariantNameRemove,
    });
  }
  if (!isEmpty(variantSku)) {
    const key = "variantSku";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, variantSku),
      onRemove: handleVariantSkuRemove,
    });
  }
  if (!isEmpty(customerName)) {
    const key = "customerName";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, customerName),
      onRemove: handleCustomerNameRemove,
    });
  }
  if (!isEmpty(phoneNumber)) {
    const key = "phoneNumber";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, phoneNumber),
      onRemove: handlePhoneNumberRemove,
    });
  }
  if (!isEmpty(qtyNeeded)) {
    const key = "quantity";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, qtyNeeded),
      onRemove: handleQuantityRemove,
    });
  }
  if (!isEmpty(inStock)) {
    const key = "inStock";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, inStock),
      onRemove: handleInStockRemove,
    });
  }

  return (
    <Frame>
      <LegacyCard>
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search"
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={() => setQueryValue("")}
          onSort={setSortSelected}
          cancelAction={{
            onAction: handleQueryValueRemove,
            disabled: false,
            loading: false,
          }}
          tabs={window.location.href.includes("availability") ? tabs : []}
          selected={selected}
          onSelect={setSelected}
          canCreateNewView={false}
          filters={filters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
          appliedFilters={appliedFilters}
        />

        <IndexTable
          resourceName={resourceName}
          itemCount={
            window.location.href.includes("availability")
              ? filteredResouces?.length > 0
                ? filteredResouces?.length
                : pagination.currentPageData.length
              : pagination.currentPageData.length
          }
          promotedBulkActions={promotedBulkActions}
          selectedItemsCount={
            allResourcesSelected
              ? "all"
              : window.location.href.includes("availability")
              ? filteredResouces.length
              : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Date" },
            { title: "Brand" },
            { title: "Variant SKU" },
            { title: "Product Name" },
            { title: "Variant Name" },
            { title: "QTY Needed" },
            { title: "In Stock" },
            { title: "Customer" },
            { title: "Phone Number" },
            { title: "Notes" },
            window.location.href.includes("availability")
              ? { title: "Status" }
              : { title: "Action" },
            ,
            window.location.href.includes("availability")
              ? { title: "Action" }
              : {},
          ]}
        >
          {rowMarkup}
        </IndexTable>
        <Box padding={"3"}>
          <HorizontalStack align="center">
            {rows?.length > PageSize &&
              ((window.location.href.includes("availability") &&
                pendingStatus?.length > 0 &&
                filteredResouces.length == 0) ||
                selectedResources?.length === 0) && (
                <Pagination
                  hasPrevious={pagination.currentPage !== 1}
                  onPrevious={pagination.onPrevious}
                  hasNext={pagination.totalPages > pagination.currentPage}
                  onNext={pagination.onNext}
                />
              )}
          </HorizontalStack>
        </Box>
        {showError && (
          <Toast
            content="Something Went Wrong"
            error
            onDismiss={errorToggle}
            duration={1500}
          />
        )}
        {showToastArchived && (
          <Toast
            content="Archieved Successfully!!"
            onDismiss={toggleActiveArchieved}
            duration={1500}
          />
        )}
        {showToastUnarchieved && (
          <Toast
            content="Unarchieved Successfully!!"
            onDismiss={toggleActiveUnarchieved}
            duration={1500}
          />
        )}
        {showToastDelete && (
          <Toast
            content="Deleted Successfully!!"
            onDismiss={toggleActiveDelete}
            duration={1500}
          />
        )}
        {showToastStatus && (
          <Toast
            error
            content="The mark as send requests can't be archieved"
            onDismiss={toggleActiveStatus}
            duration={1500}
          />
        )}
        {isDeletePopupOpen && (
          <DeletePopup
            isDeletePopupOpen={isDeletePopupOpen}
            bulkDelete={bulkDelete}
            bulk={true}
            setDeletePopupOpen={setDeletePopupOpen}
            loading={loading}
          ></DeletePopup>
        )}
        {notesModalActive && (
          <NotesModal
            handleNotesModalChange={handleNotesModalChange}
            notesModalActive={notesModalActive}
            note={Notes.note}
            id={Notes.id}
            getRequestedProducts={getRequestedProducts}
          />
        )}
      </LegacyCard>
    </Frame>
  );
  function disambiguateLabel(key, value) {
    switch (key) {
      case "brand":
        return `Brand ${value}`;
      case "variantSku":
        return `Variant SkU ${value}`;
      case "variantName":
        return `Variant Name ${value}`;
      case "productName":
        return `Product Name ${value}`;
      case "quantity":
        return `Quantity Needed ${value}`;
      case "customerName":
        return `Customer Name ${value}`;
      case "phoneNumber":
        return `Phone Number${value}`;
      case "quantity":
        return `Quantity Neeeded ${value}`;
      case "inStock":
        return `In Stock${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}
export default RequestTable;
