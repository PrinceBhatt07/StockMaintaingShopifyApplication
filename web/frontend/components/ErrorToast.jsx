import { Toast, Frame, Page, Button } from "@shopify/polaris";
import { useState, useCallback } from "react";

export default function ToastError({ errorToggle }) {
    
    return (
        <div style={{ height: "250px" }}>
            <Frame>
                <Page title="Toast example">
                    <Toast
                        content="Something Went Wrong"
                        error
                        onDismiss={errorToggle}
                        duration={1500}
                    />
                </Page>
            </Frame>
        </div>
    );
}
