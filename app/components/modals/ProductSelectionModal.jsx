import { Modal, Box, Text, Badge, Checkbox, TextField } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useSubmit } from "@remix-run/react";

export default function ProductSelectionModal({
  active,
  onClose,
  options,
  selectedProducts,
  availableProducts,
  onProductSelection,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const submit = useSubmit();

  const filteredProducts = availableProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.handle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    console.log("Search Query: ", searchQuery);

    const handleSubmit = () => {
      if (searchQuery.trim()) {
        const formData = new FormData();
        formData.append("query", searchQuery);
        formData.append("selectedProducts", JSON.stringify(selectedProducts));
        formData.append("options", JSON.stringify(options));
        formData.append("actionType", "search-products");

        submit(formData, {
          method: "post",
          replace: false,
        });
      }
    };

    const debounceTimer = setTimeout(() => {
      handleSubmit();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedProducts, options, submit]);

  return (
    <Modal
      open={active}
      onClose={onClose}
      title="Select Products to Apply Options"
      secondaryActions={[
        {
          content: "Done",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Box padding="400">
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
              <Text variant="headingMd">
                Choose products to apply your {options.length} option
                {options.length !== 1 ? "s" : ""}
              </Text>
              <Badge tone="info">{selectedProducts.length} selected</Badge>
            </div>

            <TextField
              label="Search products"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by product name or handle"
              autoComplete="off"
            />

            <Box
              background="bg-surface-secondary"
              padding="300"
              borderRadius="200"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => onProductSelection(product.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: isSelected
                          ? "2px solid #000"
                          : "1px solid #e1e1e1",
                        backgroundColor: isSelected ? "#f0f8ff" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onProductSelection(product.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Text
                          variant="bodyMd"
                          fontWeight={isSelected ? "semibold" : "regular"}
                        >
                          {product.title}
                        </Text>
                        <Text variant="bodySm" color="subdued">
                          {product.handle}
                        </Text>
                      </div>
                      {isSelected && <Badge tone="success">Selected</Badge>}
                    </div>
                  );
                })}
              </div>
            </Box>

            {selectedProducts.length > 0 && (
              <Box
                padding="300"
                background="bg-fill-tertiary"
                borderRadius="200"
              >
                <Text variant="bodySm" color="subdued">
                  <strong>Selected Products:</strong>{" "}
                  {selectedProducts
                    .map(
                      (id) => availableProducts.find((p) => p.id === id)?.title,
                    )
                    .join(", ")}
                </Text>
              </Box>
            )}

            <Text variant="bodySm" color="subdued">
              Select products where you want to apply these custom options. All{" "}
              {options.length} option{options.length !== 1 ? "s" : ""} will be
              applied to the selected products.
            </Text>
          </div>
        </Box>
      </Modal.Section>
    </Modal>
  );
}
