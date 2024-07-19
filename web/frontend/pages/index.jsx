import {
    Page,
    Layout,
    Button,
    HorizontalGrid,
    Text,
    Spinner,
    HorizontalStack,
    ButtonGroup,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import RequestTable from "../components/Request-table";
import { useNavigate } from "react-router-dom";
import RequestDate from "../components/RequestDate";
import { useAuthenticatedFetch } from "../hooks";
import { API_URL } from "../utils/apiUrls";
import EmptyState from "../components/EmptyState";
import EmpStateImg from "../assets/Images/emptyState.svg";
import { ranges } from "../utils/constants";
export default function Requests() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(0);
    const fetch = useAuthenticatedFetch();
    const [activeDateRange, setActiveDateRange] = useState(ranges[0]);
    const [allRows, setAllRows] = useState([]);
    const [all, setAll] = useState(false);
    const getRequestedProducts = async () => {
        setLoading(1);
        try {
            const response = await fetch(API_URL.getRequest);
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

    useEffect(() => {
        getRequestedProducts();
    }, []);

    const navigateToNew = () => {
        navigate("/new-request");
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
    const handleClearButtonClick = () => {
        setActiveDateRange(ranges[0]);
    };
    return (
        <Page fullWidth>
            <div className="Titlebar">
                <HorizontalGrid columns={["twoThirds", "oneThird"]} gap="10">
                    <div>
                        <Text variant="headingXl" as="h2">
                            All Requests
                        </Text>
                    </div>
                    <div className="titleBarButton">
                        <Button onClick={navigateToNew}>Add Request</Button>
                    </div>
                </HorizontalGrid>
            </div>

            <Layout>
                <Layout.Section>
                    <div style={{ marginBottom: "20px" }}>
                        <HorizontalStack columns={2} gap="2">
                            <ButtonGroup>
                                <RequestDate
                                    onDateChange={onDateChange}
                                    setActiveDateRange={setActiveDateRange}
                                    activeDateRange={activeDateRange}
                                    setAll={setAll}
                                    all={all}
                                ></RequestDate>
                                <Button
                                    size="slim"
                                    variant="primary"
                                    disabled={!all}
                                    onClick={() => {
                                        getRequestedProducts();
                                        handleClearButtonClick();
                                        setAll(false);
                                    }}
                                >
                                    Clear
                                </Button>
                            </ButtonGroup>
                        </HorizontalStack>
                    </div>
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
                            getRequestedProducts={getRequestedProducts}
                        />
                    )}
                    {loading == 3 && (
                        <EmptyState
                            heading="No Requests"
                            text=" All the product requests will be shown here"
                            image={EmpStateImg}
                        />
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
