import { Button, Frame, Modal, Icon, Tooltip, Toast } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { DeleteMinor } from "@shopify/polaris-icons";
import { API_URL } from "../utils/apiUrls";
import { useAuthenticatedFetch } from "../hooks";

function DeletePopup({
    id,
    getArchivedProducts,
    bulk,
    bulkDelete,
    isDeletePopupOpen,
    setDeletePopupOpen,
    loading,
}) {
    const [active, setActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [showError, setShowError] = useState(false);
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
    const handleChange = useCallback(() => {
        setActive(!active), [active];
        if (bulk == true) {
            setDeletePopupOpen(!isDeletePopupOpen);
        }
    });
    const fetch = useAuthenticatedFetch();
    const activator = (
        <Button variant="plain" onClick={handleChange}>
            <Tooltip content="Delete Request">
                <Icon source={DeleteMinor} tone="base" />
            </Tooltip>
        </Button>
    );

    const deleteProduct = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("id", id);

        try {
            const response = await fetch(API_URL.deleteRequest, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setIsLoading(false);
            if (data.status == "success") {
                toggleActive();
                setTimeout(() => {
                    getArchivedProducts();
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
        <div className="deletePopup">
            <div className="modalBoxOuter">
                <Frame>
                    <Modal
                        activator={bulk ? bulk : activator}
                        open={bulk ? isDeletePopupOpen : active}
                        onClose={handleChange}
                        title="Delete archieve"
                        primaryAction={{
                            content: bulk
                                ? "Delete Requests"
                                : "Delete Request",
                            loading: bulk ? loading : isLoading,
                            onAction: bulk ? bulkDelete : deleteProduct,
                        }}
                        secondaryActions={[
                            {
                                content: "Cancel",
                                onAction: handleChange,
                            },
                        ]}
                    >
                        {bulk ? (
                            <Modal.Section>
                                <div>
                                    <p>
                                        Are you sure you want to Delete
                                        archieved requests?
                                    </p>
                                </div>
                            </Modal.Section>
                        ) : (
                            <Modal.Section>
                                <div>
                                    <p>
                                        Are you sure you want to Delete
                                        archieved request?
                                    </p>
                                </div>
                            </Modal.Section>
                        )}
                        {toastActive && (
                            <Toast
                                content="Deleted Successfully"
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
                </Frame>
            </div>
        </div>
    );
}
export default DeletePopup;
