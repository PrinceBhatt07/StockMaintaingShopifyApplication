import { Text, LegacyStack } from "@shopify/polaris";
import React, { useEffect, useState } from "react";

function CustomerDetail({ customerData, personal_info }) {
    const [customer, setCustmer] = useState({});
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (customerData?.length == 0 || customerData == undefined) {
            setShow(false);
        } else {
            setCustmer(customerData);
            setShow(true);
        }
    }, [personal_info, customerData]);
    const customerAddress = customer?.row ? JSON.parse(customer?.row) : {};
    const address1Value =
        customerAddress?.length == 0
            ? "Not Provided"
            : customerAddress.address1 == "" || null
            ? "Not Provided"
            : customerAddress?.address1;
    const address2Value =
        customerAddress?.length == 0
            ? "Not Provided"
            : customerAddress.address2 == "" || null
            ? "Not Provided"
            : customerAddress?.address2;
    return (
        show && (
            <div className="CustomerDetails">
                <LegacyStack vertical>
                    <Text variant="headingLg" as="h5">
                        Customer
                    </Text>
                    <Text variant="bodyLg" as="p">
                        {customer?.first_name + " " + customer?.last_name}
                        <br />
                    </Text>
                </LegacyStack>
                <LegacyStack vertical>
                    <Text variant="headingLg" as="h5">
                        Contact Information
                    </Text>
                    <Text variant="bodyLg" as="p">
                        {customer?.email == null || ""
                            ? "Not Provided"
                            : customer?.email}
                        <br />
                        {customer?.phone == null || ""
                            ? "Not Provided"
                            : customer?.phone}
                    </Text>
                </LegacyStack>
                <LegacyStack vertical>
                    <Text variant="headingLg" as="h5">
                        Shipping address
                    </Text>
                    <Text variant="bodyLg" as="p">
                        {address1Value == null || ""
                            ? "Not Provided"
                            : address1Value}
                    </Text>
                </LegacyStack>
                <LegacyStack vertical>
                    <Text variant="headingLg" as="h5">
                        Billing Address
                    </Text>
                    <Text variant="bodyLg" as="p">
                        {address2Value == null || ""
                            ? "Not Provided"
                            : address2Value}
                    </Text>
                </LegacyStack>
            </div>
        )
    );
}
export default CustomerDetail;
