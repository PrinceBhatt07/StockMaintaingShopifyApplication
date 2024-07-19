import {
    Box,
    Button,
    DatePicker,
    Popover,
    HorizontalStack,
    HorizontalGrid,
    TextField,
    Scrollable,
    OptionList,
    Icon,
    useBreakpoints,
} from "@shopify/polaris";
import React from "react";
import { CalendarMinor, ArrowRightMinor } from "@shopify/polaris-icons";
import { useState, useRef, useEffect } from "react";
import { ranges } from "../utils/constants";
function RequestDate({
    onDateChange,
    activeDateRange,
    setActiveDateRange,
    all,
    setAll,
}) {
    const { mdDown, lgUp } = useBreakpoints();
    const shouldShowMultiMonth = lgUp;
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const yesterday = new Date(
        new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const [popoverActive, setPopoverActive] = useState(false);
    const [inputValues, setInputValues] = useState({});
    const [{ month, year }, setDate] = useState({
        month: activeDateRange.period.since.getMonth(),
        year: activeDateRange.period.since.getFullYear(),
    });
    const datePickerRef = useRef(null);
    const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;
    function isDate(date) {
        return !isNaN(new Date(date).getDate());
    }
    function isValidYearMonthDayDateString(date) {
        return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
    }
    function isValidDate(date) {
        return date.length === 10 && isValidYearMonthDayDateString(date);
    }
    function parseYearMonthDayDateString(input) {
        const [year, month, day] = input.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day));
    }
    function formatDateToYearMonthDayDateString(date) {
        const year = String(date.getFullYear());
        let month = String(date.getMonth() + 1);
        let day = String(date.getDate());
        if (month.length < 2) {
            month = String(month).padStart(2, "0");
        }
        if (day.length < 2) {
            day = String(day).padStart(2, "0");
        }
        return [year, month, day].join("-");
    }
    function formatDate(date) {
        return formatDateToYearMonthDayDateString(date);
    }
    function nodeContainsDescendant(rootNode, descendant) {
        if (rootNode === descendant) {
            return true;
        }
        let parent = descendant.parentNode;
        while (parent != null) {
            if (parent === rootNode) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }
    function isNodeWithinPopover(node) {
        return datePickerRef?.current
            ? nodeContainsDescendant(datePickerRef.current, node)
            : false;
    }
    function handleStartInputValueChange(value) {
        setInputValues((prevState) => {
            return { ...prevState, since: value };
        });

        if (isValidDate(value)) {
            const newSince = parseYearMonthDayDateString(value);
            setActiveDateRange((prevState) => {
                const newPeriod =
                    prevState.period && newSince <= prevState.period.until
                        ? { since: newSince, until: prevState.period.until }
                        : { since: newSince, until: newSince };
                return {
                    ...prevState,
                    period: newPeriod,
                };
            });
        }
    }
    function handleEndInputValueChange(value) {
        setInputValues((prevState) => ({ ...prevState, until: value }));
        if (isValidDate(value)) {
            const newUntil = parseYearMonthDayDateString(value);
            setActiveDateRange((prevState) => {
                const newPeriod =
                    prevState.period && newUntil >= prevState.period.since
                        ? { since: prevState.period.since, until: newUntil }
                        : { since: newUntil, until: newUntil };
                return {
                    ...prevState,
                    period: newPeriod,
                };
            });
        }
    }
    function handleInputBlur({ relatedTarget }) {
        const isRelatedTargetWithinPopover =
            relatedTarget != null && isNodeWithinPopover(relatedTarget);
        if (isRelatedTargetWithinPopover) {
            return;
        }
        setPopoverActive(false);
    }
    function handleMonthChange(month, year) {
        setDate({ month, year });
    }
    function handleCalendarChange({ start, end }) {
        setAll(true);
        const newDateRange = ranges.find((range) => {
            return (
                range.period.since.valueOf() === start.valueOf() &&
                range.period.until.valueOf() === end.valueOf()
            );
        }) || {
            alias: "custom",
            title: "Custom",
            period: {
                since: start,
                until: end,
            },
        };

        setActiveDateRange(newDateRange);
        onDateChange(newDateRange);
    }

    function apply() {
        setPopoverActive(false);
    }
    function cancel() {
        setPopoverActive(false);
    }
    useEffect(() => {
        if (activeDateRange) {
            setInputValues({
                since: formatDate(activeDateRange.period.since),
                until: formatDate(activeDateRange.period.until),
            });
            function monthDiff(referenceDate, newDate) {
                return (
                    newDate.month -
                    referenceDate.month +
                    12 * (referenceDate.year - newDate.year)
                );
            }
            const monthDifference = monthDiff(
                { year, month },
                {
                    year: activeDateRange.period.until.getFullYear(),
                    month: activeDateRange.period.until.getMonth(),
                }
            );
            if (monthDifference > 1 || monthDifference < 0) {
                setDate({
                    month: activeDateRange.period.until.getMonth(),
                    year: activeDateRange.period.until.getFullYear(),
                });
            }
        }
    }, [activeDateRange]);
    const buttonValue =
        activeDateRange.title === "Custom"
            ? activeDateRange.period.since.toDateString() +
              " - " +
              activeDateRange.period.until.toDateString()
            : activeDateRange.title;
    return (
        <div className="datePickerC">
            <Popover
                active={popoverActive}
                autofocusTarget="none"
                preferredAlignment="left"
                preferredPosition="below"
                fluidContent
                sectioned={false}
                fullHeight
                activator={
                    <Button
                        size="slim"
                        icon={CalendarMinor}
                        onClick={() => setPopoverActive(!popoverActive)}
                    >
                        {!all ? "All" : buttonValue}
                    </Button>
                }
                onClose={() => setPopoverActive(false)}
            >
                <Popover.Pane fixed>
                    <HorizontalGrid
                        columns={{
                            xs: "1fr",
                            mdDown: "1fr",
                            md: "max-content max-content",
                        }}
                        gap={0}
                        ref={datePickerRef}
                    >
                        <Box
                            maxWidth={mdDown ? "516px" : "212px"}
                            width={mdDown ? "100%" : "212px"}
                            padding={{ xs: 500, md: 0 }}
                            paddingBlockEnd={{ xs: 100, md: 0 }}
                        >
                            {mdDown ? (
                                <Select
                                    label="dateRangeLabel"
                                    labelHidden
                                    onChange={(value) => {
                                        const result = ranges.find(
                                            ({ title, alias }) =>
                                                title === value ||
                                                alias === value
                                        );
                                        setActiveDateRange(result);
                                    }}
                                    value={
                                        activeDateRange?.title ||
                                        activeDateRange?.alias ||
                                        ""
                                    }
                                    options={ranges.map(
                                        ({ alias, title }) => title || alias
                                    )}
                                />
                            ) : (
                                <Scrollable style={{ height: "334px" }}>
                                    <OptionList
                                        options={ranges.map((range) => ({
                                            value: range.alias,
                                            label: range.title,
                                        }))}
                                        selected={activeDateRange.alias}
                                        onChange={(value) => {
                                            setAll(true);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const yesterday = new Date();
                                            yesterday.setDate(
                                                yesterday.getDate() - 1
                                            );
                                            const tomorrow = new Date();
                                            tomorrow.setDate(
                                                tomorrow.getDate() + 1
                                            );
                                            tomorrow.setHours(0, 0, 0, 0);
                                            yesterday.setHours(0, 0, 0, 0);

                                            const last7Days = new Date();
                                            last7Days.setDate(
                                                last7Days.getDate() - 6
                                            );
                                            last7Days.setHours(0, 0, 0, 0);
                                            const last30Days = new Date();
                                            last30Days.setDate(
                                                last30Days.getDate() - 29
                                            );
                                            last30Days.setHours(0, 0, 0, 0);
                                            const last90Days = new Date();
                                            last90Days.setDate(
                                                last90Days.getDate() - 89
                                            );
                                            last90Days.setHours(0, 0, 0, 0);

                                            if (value.includes("today")) {
                                                const newDateRange = {
                                                    title: "Custom",
                                                    period: {
                                                        since: today,
                                                        until: today,
                                                    },
                                                };
                                                onDateChange(newDateRange);
                                            } else if (
                                                value.includes("yesterday")
                                            ) {
                                                const newDateRange = {
                                                    title: "Custom",
                                                    period: {
                                                        since: yesterday,
                                                        until: yesterday,
                                                    },
                                                };
                                                onDateChange(newDateRange);
                                            } else if (
                                                value.includes("last7days")
                                            ) {
                                                const newDateRange = {
                                                    title: "Custom",
                                                    period: {
                                                        since: last7Days,
                                                        until: today,
                                                    },
                                                };
                                                onDateChange(newDateRange);
                                            } else if (
                                                value.includes("last30days")
                                            ) {
                                                const newDateRange = {
                                                    title: "Custom",
                                                    period: {
                                                        since: last30Days,
                                                        until: today,
                                                    },
                                                };
                                                onDateChange(newDateRange);
                                            } else if (
                                                value.includes("last90days")
                                            ) {
                                                const newDateRange = {
                                                    title: "Custom",
                                                    period: {
                                                        since: last90Days,
                                                        until: today,
                                                    },
                                                };
                                                onDateChange(newDateRange);
                                            }
                                            setActiveDateRange(
                                                ranges.find(
                                                    (range) =>
                                                        range.alias === value[0]
                                                )
                                            );
                                        }}
                                    />
                                </Scrollable>
                            )}
                        </Box>
                        <Box padding="4" maxWidth={mdDown ? "320px" : "525px"}>
                            <HorizontalStack>
                                <TextField
                                    role="combobox"
                                    label={"Since"}
                                    labelHidden
                                    prefix={<Icon source={CalendarMinor} />}
                                    value={inputValues.since}
                                    onChange={handleStartInputValueChange}
                                    onBlur={handleInputBlur}
                                    autoComplete="off"
                                    disabled
                                />
                                <Icon source={ArrowRightMinor} />
                                <TextField
                                    role="combobox"
                                    label={"Until"}
                                    labelHidden
                                    prefix={<Icon source={CalendarMinor} />}
                                    value={inputValues.until}
                                    onChange={handleEndInputValueChange}
                                    onBlur={handleInputBlur}
                                    autoComplete="off"
                                    disabled
                                />
                                <div style={{ paddingTop: "20px" }}>
                                    <DatePicker
                                        month={month}
                                        year={year}
                                        selected={{
                                            start: activeDateRange.period.since,
                                            end: activeDateRange.period.until,
                                        }}
                                        onMonthChange={handleMonthChange}
                                        onChange={handleCalendarChange}
                                        multiMonth={shouldShowMultiMonth}
                                        allowRange
                                    />
                                </div>
                            </HorizontalStack>
                        </Box>
                    </HorizontalGrid>
                </Popover.Pane>
                <Popover.Pane fixed>
                    <Popover.Section>
                        <HorizontalStack align="end" gap="4">
                            <Button onClick={cancel}>Close</Button>
                            <Button primary onClick={apply}>
                                Apply
                            </Button>
                        </HorizontalStack>
                    </Popover.Section>
                </Popover.Pane>
            </Popover>
        </div>
    );
}
export default RequestDate;
