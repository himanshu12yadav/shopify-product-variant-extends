import {
  Card,
  Box,
  Text,
  Button,
  Divider
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

export default function OptionsHeader({
  onAddOption,
  onSelectProducts,
  onApplyOptions,
  optionsCount,
  selectedProductsCount,
  isLoading
}) {
  return (
    <Card>
      <Box padding="500">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Text variant="headingLg" as="h1">
              Product Options Manager
            </Text>
            <Text variant="bodyMd" as="p" color="subdued">
              Create and manage custom product options to enhance your
              store with additional fields and variations.
            </Text>
          </div>
          <Divider />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Button
              primary
              icon={PlusIcon}
              onClick={onAddOption}
              loading={isLoading}
            >
              Add New Option
            </Button>
            <Button
              onClick={onSelectProducts}
              disabled={optionsCount === 0}
            >
              Select Products ({selectedProductsCount})
            </Button>
            <Button
              onClick={onApplyOptions}
              disabled={selectedProductsCount === 0 || optionsCount === 0}
              loading={isLoading}
              tone="success"
              type="button"
            >
              Apply Options
            </Button>
            <Text variant="bodySm" color="subdued">
              {optionsCount}{" "}
              {optionsCount === 1 ? "option" : "options"} created
            </Text>
          </div>
        </div>
      </Box>
    </Card>
  );
}