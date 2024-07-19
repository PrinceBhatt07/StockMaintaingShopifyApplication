import {
  ButtonGroup,
  Button,
  HorizontalGrid,
  LegacyCard,
  FormLayout,
  Listbox,
  Combobox,
  Icon,
} from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect, useMemo } from "react";
function PersonalInfo({
  isOpen,
  handleButtonClick,
  activeButtonIndex,
  customerOptions,
  personal_info,
  onCustomerDataChange,
  select,
}) {
  const slicedCustomers = customerOptions.slice(0, 500);
  const slicedDeselectedCustomers = useMemo(
    () => slicedCustomers,
    [slicedCustomers]
  );
  const deselectedOptions = useMemo(() => customerOptions, [customerOptions]);
  const [selectedOption, setSelectedOption] = useState();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(slicedDeselectedCustomers);

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
          const escapedValue = value?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const filterRegex = new RegExp(escapedValue, "i");
          const resultOptions = deselectedOptions?.filter(
            (option) =>
              option?.label?.match(filterRegex) ||
              option?.value?.toString().includes(value) ||
              option?.email?.toString().includes(value) ||
              option?.phone?.toString().includes(value)
          );
          setOptions(resultOptions);
          setLoading(false);
        }
      }, 100);
    },
    [deselectedOptions, options, loading]
  );
  const handleFocus = useCallback((val) => {
    setOptions(slicedDeselectedCustomers);
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
            option?.label?.match(filterRegex) ||
            option?.value?.toString().includes(value) ||
            option?.email?.toString().includes(value) ||
            option?.phone?.toString().includes(value)
        );
        setOptions(resultOptions);
      }
    }, 100);
  });
  console.log(selectedOption, inputValue, "----valueeeeeeeeee");
  useEffect(() => {
    updateText();
  }, [deselectedOptions]);
  useEffect(() => {
    if (select) {
      setOptions(customerOptions);
      setInputValue("");
      setSelectedOption(undefined);
    }
  }, [select]);
  const updateSelection = useCallback(
    (selected) => {
      const matchedOption = options.find(
        (option) => option?.value === selected
      );
      setSelectedOption(selected);
      setInputValue((matchedOption && matchedOption.label) || "");
      const filteredData = personal_info.filter((item) => {
        return item.customer_id == selected;
      });
      onCustomerDataChange(filteredData[0]);
    },
    [options]
  );

  const optionsMarkup =
    options?.length > 0
      ? options.map((option) => {
          const { label, value, email } = option;

          return (
            <Listbox.Option
              key={`${value}`}
              value={value}
              selected={selectedOption === value}
              accessibilityLabel={label}
            >
              {label + "-" + email}
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
    <LegacyCard sectioned>
      <FormLayout>
        {!isOpen && (
          <HorizontalGrid columns={2} gap={"5"}>
            <ButtonGroup segmented>
              <Button
                pressed={activeButtonIndex === 0}
                onClick={() => handleButtonClick(0)}
              >
                Already a Customer
              </Button>
              <Button
                pressed={activeButtonIndex === 1}
                onClick={() => handleButtonClick(1)}
              >
                New Customer
              </Button>
            </ButtonGroup>
            {!isOpen && (
              <Combobox
                activator={
                  <Combobox.TextField
                    prefix={<Icon source={SearchMinor} />}
                    onChange={updateText}
                    onFocus={handleFocus}
                    label="Search Customer"
                    labelHidden
                    value={inputValue}
                    placeholder="Search Customer"
                    autoComplete="off"
                  />
                }
              >
                {listboxMarkup}
              </Combobox>
            )}
          </HorizontalGrid>
        )}
        {isOpen && (
          <HorizontalGrid columns={1} gap={"5"}>
            <ButtonGroup segmented>
              <Button
                pressed={activeButtonIndex === 0}
                onClick={() => handleButtonClick(0)}
              >
                Already a Customer
              </Button>
              <Button
                pressed={activeButtonIndex === 1}
                onClick={() => handleButtonClick(1)}
              >
                New Customer
              </Button>
            </ButtonGroup>
            {!isOpen && (
              <Combobox
                activator={
                  <Combobox.TextField
                    prefix={<Icon source={SearchIcon} />}
                    onChange={updateText}
                    label="Search Customer"
                    labelHidden
                    value={inputValue}
                    placeholder="Search Customer"
                    autoComplete="off"
                  />
                }
              >
                {listboxMarkup}
              </Combobox>
            )}
          </HorizontalGrid>
        )}
      </FormLayout>
    </LegacyCard>
  );
}
export default PersonalInfo;
