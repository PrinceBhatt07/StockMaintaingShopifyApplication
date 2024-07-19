import { Button, Frame, Modal, Icon, Tooltip, Toast } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { ArchiveMinor } from "@shopify/polaris-icons";
import { API_URL } from "../utils/apiUrls";
import { useAuthenticatedFetch } from "../hooks";

function ArcheivePopup({
    id,
    getRequestedProducts,
    archieved,
    message_status,
}) {
    const [active, setActive] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [showError, setShowError] = useState(false);
    const fetch = useAuthenticatedFetch();
    const toggleActive = useCallback(
        () => setToastActive((toastActive) => !toastActive),
        []
    );
    const errorToggleActive = useCallback(
        () => setShowErrorToast((showErrorToast) => !showErrorToast),
        []
    );
    const errorToggle = useCallback(
        () => setShowError((showError) => !showError),
        []
    );
    const handleChange = useCallback(() => setActive(!active), [active]);

    const activator = (
        <Button variant="plain" onClick={handleChange}>
            <Tooltip
                content={archieved ? "Unarchive Request" : "Archive Request"}
            >
                <Icon source={ArchiveMinor} tone="base" />
            </Tooltip>
        </Button>
    );
    const archiveProduct = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("id", id);

        try {
            const response = await fetch(API_URL.archiveProducts, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setIsLoading(false);
            if (data.status == "success") {
                toggleActive();
                setTimeout(() => {
                    getRequestedProducts();
                }, [1000]);
            } else {
                if (data?.message?.length === 1) {
                    setToastMsg(data?.message[0]);
                } else {
                    setToastMsg(
                        `${data?.message
                            ?.map(
                                (error, index) =>
                                    `There are some errors:(${index}) ${error}`
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
    };
    const unArchiveProduct = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("id", id);

        try {
            const response = await fetch(API_URL.unArchiveProducts, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setIsLoading(false);
            if (data.status == "success") {
                toggleActive();
                setTimeout(() => {
                    getRequestedProducts();
                }, [1000]);
            } else {
                if (data?.message?.length === 1) {
                    setToastMsg(data?.message[0]);
                } else {
                    setToastMsg(
                        `${data?.message
                            ?.map(
                                (error, index) =>
                                    `There are some errors:(${index}) ${error}`
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
    };

    return (
        <div className="modalBoxOuter">
            <Frame>
                {window.location.href.includes("availability") &&
                message_status == "pending" ? (
                    <Modal
                        activator={activator}
                        open={active}
                        onClose={handleChange}
                        title={
                            archieved ? "Unarchive Request" : "Archive Request"
                        }
                        primaryAction={{
                            content: "Ok",
                            onAction: handleChange,
                        }}
                    >
                        <Modal.Section>
                            <div>
                                <p>
                                    You Can only Archive Message Sent Requests
                                </p>
                            </div>
                        </Modal.Section>
                    </Modal>
                ) : (
                    <Modal
                        activator={activator}
                        open={active}
                        onClose={handleChange}
                        title={
                            archieved ? "Unarchive Request" : "Archive Request"
                        }
                        primaryAction={{
                            content: "Confirm",
                            loading: isLoading,
                            onAction: archieved
                                ? unArchiveProduct
                                : archiveProduct,
                        }}
                        secondaryActions={[
                            {
                                content: "Cancel",
                                onAction: handleChange,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <div>
                                <p>
                                    Are you sure you want to{" "}
                                    {archieved ? "unarchive" : "archive"} this
                                    request?
                                </p>
                            </div>
                        </Modal.Section>
                        {toastActive && (
                            <Toast
                                content={`${
                                    archieved ? "Unarchived" : "Archived"
                                } Successfully!!`}
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
                    </Modal>
                )}
            </Frame>
        </div>
    );
}
export default ArcheivePopup;
