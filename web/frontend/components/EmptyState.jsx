import React from "react";
import { LegacyCard, Text } from "@shopify/polaris";

function EmptyState({ heading, text, image }) {
    return (
        <LegacyCard>
            <div className="emptyStateContainer">
                <div className="emptyState">
                    <div className="emptyImg">
                        <img src={image} alt="" />
                    </div>
                    <Text as="h6" variant="headingMd">
                        {heading}
                    </Text>
                    <Text as="p" variant="bodyMd">
                        {text}
                    </Text>
                </div>
            </div>
        </LegacyCard>
    );
}

export default EmptyState;
