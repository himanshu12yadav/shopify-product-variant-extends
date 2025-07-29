import {
  ResourceItem,
  Box,
  Text,
  Badge,
  Checkbox,
  Button
} from "@shopify/polaris";
import {
  EditIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";

export default function OptionItem({
  option,
  isExpanded,
  onToggleExpansion,
  onToggleAllValues,
  onToggleValueChecked,
  onEdit,
  onDelete
}) {
  const { id, name, values, type } = option;

  return (
    <ResourceItem
      id={id}
      accessibilityLabel={`View details for ${name}`}
    >
      <Box padding="400">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Text variant="headingMd" as="h3">
                {name}
              </Text>
              <Badge
                tone={
                  type === "color"
                    ? "info"
                    : type === "number"
                      ? "success"
                      : type === "image"
                        ? "warning"
                        : "default"
                }
              >
                {type}
              </Badge>
              <Checkbox
                label="Select All"
                checked={values.every((v) => v.checked)}
                indeterminate={
                  values.some((v) => v.checked) &&
                  !values.every((v) => v.checked)
                }
                onChange={() => onToggleAllValues(id)}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Text variant="bodySm" color="subdued">
                {values.filter((v) => v.checked).length}{" "}
                of {values.length} values active
              </Text>
              <Button
                variant="plain"
                size="slim"
                icon={
                  isExpanded
                    ? ChevronUpIcon
                    : ChevronDownIcon
                }
                onClick={() => onToggleExpansion(id)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>
            {isExpanded && (
              <Box paddingBlockStart="200">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  {values.map((value) => (
                    <Checkbox
                      key={`${id}-${value.name}`}
                      label={value.name}
                      checked={value.checked}
                      onChange={() =>
                        onToggleValueChecked(id, value.name)
                      }
                    />
                  ))}
                </div>
              </Box>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              size="slim"
              icon={EditIcon}
              variant="tertiary"
              onClick={() => onEdit(option)}
            >
              Edit
            </Button>
            <Button
              size="slim"
              icon={DeleteIcon}
              variant="tertiary"
              tone="critical"
              onClick={() => onDelete && onDelete(option.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Box>
    </ResourceItem>
  );
}