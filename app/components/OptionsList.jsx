import {
  Card,
  Box,
  Text,
  Badge,
  EmptyState,
  ResourceList
} from "@shopify/polaris";
import OptionItem from "./OptionItem.jsx";

export default function OptionsList({
  options,
  expandedOptions,
  selectedItems,
  onSelectionChange,
  onToggleExpansion,
  onToggleAllValues,
  onToggleValueChecked,
  onEdit,
  onBulkDelete,
  onAddOption
}) {
  const promotedBulkActions = [
    { content: "Delete options", onAction: onBulkDelete },
  ];

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
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="headingMd" as="h2">
              Current Options
            </Text>
            <Badge tone="info">{options.length}</Badge>
          </div>
          {options.length === 0 ? (
            <EmptyState
              heading="No options created yet"
              action={{
                content: "Add your first option",
                onAction: onAddOption,
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <Text variant="bodyMd" as="p">
                Start by creating product options to enhance your store.
              </Text>
            </EmptyState>
          ) : (
            <ResourceList
              resourceName={{ singular: "option", plural: "options" }}
              items={options}
              selectable
              selectedItems={selectedItems}
              onSelectionChange={onSelectionChange}
              promotedBulkActions={promotedBulkActions}
              renderItem={(item) => (
                <OptionItem
                  key={item.id}
                  option={item}
                  isExpanded={expandedOptions[item.id] || false}
                  onToggleExpansion={onToggleExpansion}
                  onToggleAllValues={onToggleAllValues}
                  onToggleValueChecked={onToggleValueChecked}
                  onEdit={onEdit}
                />
              )}
            />
          )}
        </div>
      </Box>
    </Card>
  );
}