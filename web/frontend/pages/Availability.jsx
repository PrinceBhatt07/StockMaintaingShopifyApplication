import {
    Page,
    Layout,
    Button,
    HorizontalGrid,
    HorizontalStack,
    Text,
    Spinner,
    EmptyState,
} from "@shopify/polaris";
import React, { useState, useEffect } from "react";
import RequestTable from "../components/Request-table";
import RequestDate from "../components/RequestDate";
import { useAuthenticatedFetch } from "../hooks";
import { API_URL } from "../utils/apiUrls";
import BackinStockEmpty from "../assets/Images/BackinStockEmpty.svg";
import { ranges } from "../utils/constants";
export default function Availability() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(0);
    const [allRows, setAllRows] = useState([]);
    const [activeDateRange, setActiveDateRange] = useState(ranges[0]);
    const fetch = useAuthenticatedFetch();
    const [all, setAll] = useState(false);
    const getAvailableProducts = async () => {
        setLoading(1);
        try {
            const response = await fetch(API_URL.getAvailableProducts);
            const data = await response.json();
            if (Array.isArray(data.data) && data.data.length > 0) {
                setRows(data.data);
                setAllRows(data.data);
                setLoading(2);
            }
            if (data.status == "error") {
                setLoading(3);
            }
        } catch (err) {
            setLoading(2);
        }
    };
    const handleClearButtonClick = () => {
        setActiveDateRange(ranges[0]);
    };
    const onDateChange = (data) => {
        const start = new Date(data.period.since);
        const end = new Date(data.period.until);
        end.setDate(end.getDate() + 1);
        const filteredData = allRows?.filter((item) => {
            const createdAt = new Date(item.created_at);
            return createdAt >= start && createdAt <= end;
        });
        if (filteredData.length > 0) {
            setRows(filteredData);
            setLoading(2);
        } else {
            setRows(rows);
            setLoading(3);
        }
    };
    useEffect(() => {
        getAvailableProducts();
    }, []);
    return (
        <Page fullWidth>
            <div className="Titlebar">
                <HorizontalGrid columns={["twoThirds", "oneThird"]} gap="10">
                    <div>
                        <Text variant="headingXl" as="h2">
                            Products Back in Stock
                        </Text>
                    </div>
                </HorizontalGrid>
            </div>
            <Layout>
                <Layout.Section>
                    <div style={{ marginBottom: "20px" }}>
                        <HorizontalStack columns={2} gap="2">
                            <RequestDate
                                onDateChange={onDateChange}
                                activeDateRange={activeDateRange}
                                setActiveDateRange={setActiveDateRange}
                                setAll={setAll}
                                all={all}
                            ></RequestDate>
                            <Button
                                size="slim"
                                variant="primary"
                                disabled={!all}
                                onClick={() => {
                                    getAvailableProducts();
                                    handleClearButtonClick();
                                    setAll(false);
                                }}
                            >
                                Clear
                            </Button>
                        </HorizontalStack>
                    </div>
                    <div className="availSection">
                        {loading == 1 && (
                            <div className="spinner">
                                <Spinner
                                    accessibilityLabel="Spinner example"
                                    size="large"
                                />
                            </div>
                        )}

                        {loading == 2 && (
                            <RequestTable
                                deleteHide={true}
                                rows={rows}
                                getAvaialableProducts={getAvailableProducts}
                            />
                        )}
                        {loading == 3 && (
                            <EmptyState
                                heading="None of the products are back in stock yet"
                                text="When they are in stock it will be seen here"
                                image={BackinStockEmpty}
                            />
                        )}
                    </div>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
