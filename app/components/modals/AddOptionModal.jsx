/**
 * AddOptionModal Component
 * 
 * A modal dialog for creating new product options. This modal allows users to:
 * - Enter an option name (e.g., "Color", "Size")
 * - Select an option type (text, number, image, color)
 * - Add multiple values for the option
 * - Remove values by clicking on them
 * 
 * Key Features:
 * - Form validation ensures at least one value is added
 * - Prevents duplicate values
 * - Resets form state after successful submission
 * - Different option types affect how values are displayed to customers
 */

import {
  Modal,
  Box,
  FormLayout,
  TextField,
  Button,
  Select,
  Text,
  Badge
} from "@shopify/polaris";
import { useState } from "react";

export default function AddOptionModal({
  active,      // Boolean - whether modal is open
  onClose,     // Function - called when modal should close  
  onSubmit,    // Function - called when form is submitted
  isLoading    // Boolean - whether form is currently submitting
}) {
  // Form state management
  const [optionName, setOptionName] = useState("");        // Name of the new option
  const [optionValues, setOptionValues] = useState([]);    // Array of values for the option
  const [currentValue, setCurrentValue] = useState("");    // Current value being typed
  const [optionType, setOptionType] = useState("text");    // Type of option (text, color, number, image)

  /**
   * Add a new value to the option's value list
   * Prevents duplicate values and clears the input field
   */
  const addValueToList = () => {
    if (currentValue && !optionValues.includes(currentValue)) {
      setOptionValues([...optionValues, currentValue]);
      setCurrentValue(""); // Clear input after adding
    }
  };

  /**
   * Remove a value from the option's value list
   * This is called when a user clicks on a value badge
   * @param {string} valueToRemove - The value to remove from the list
   */
  const removeValue = (valueToRemove) => {
    setOptionValues(optionValues.filter((value) => value !== valueToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (optionName && optionValues.length > 0) {
      onSubmit({
        optionName,
        values: optionValues,
        optionType
      });
      
      // Reset form
      setOptionName("");
      setOptionValues([]);
      setCurrentValue("");
      setOptionType("text");
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setOptionName("");
    setOptionValues([]);
    setCurrentValue("");
    setOptionType("text");
    onClose();
  };

  return (
    <Modal
      open={active}
      onClose={handleClose}
      title="Add Product Option"
    >
      <Modal.Section>
        <Box padding="400">
          <FormLayout>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <TextField
                label="Option Name"
                value={optionName}
                onChange={setOptionName}
                autoComplete="off"
                placeholder="e.g., Color, Size, Material"
                helpText="Enter a descriptive name for this product option"
                requiredIndicator
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <TextField
                  label="Add Values"
                  value={currentValue}
                  onChange={setCurrentValue}
                  autoComplete="off"
                  placeholder="e.g., Red, Blue, Green"
                  helpText="Press Enter or click Add to create multiple options"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addValueToList();
                    }
                  }}
                  connectedRight={
                    <Button
                      onClick={addValueToList}
                      disabled={!currentValue}
                    >
                      Add
                    </Button>
                  }
                />
                {optionValues.length > 0 && (
                  <Box paddingBlockStart="300">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <Text variant="bodySm" color="subdued">
                        Added values ({optionValues.length}):
                      </Text>
                      <Box
                        background="bg-surface-secondary"
                        padding="300"
                        borderRadius="200"
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {optionValues.map((value, index) => (
                            <Badge
                              key={index}
                              tone="info"
                              onClick={() => removeValue(value)}
                              style={{ cursor: "pointer" }}
                            >
                              {value} ✕
                            </Badge>
                          ))}
                        </div>
                      </Box>
                    </div>
                  </Box>
                )}
              </div>

              <Select
                label="Option Type"
                value={optionType}
                onChange={setOptionType}
                options={[
                  { label: "📝 Text Input", value: "text" },
                  { label: "🔢 Number Input", value: "number" },
                  { label: "🖼️ Image Upload", value: "image" },
                  { label: "🎨 Color Picker", value: "color" },
                ]}
                helpText="Choose how customers will interact with this option"
              />
            </div>
          </FormLayout>

          <Box paddingBlockStart="500">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button onClick={handleClose} size="large">
                Cancel
              </Button>
              <Button
                primary
                size="large"
                onClick={handleSubmit}
                disabled={!optionName || optionValues.length === 0}
                loading={isLoading}
              >
                {isLoading ? "Creating..." : "Add Option"}
              </Button>
            </div>
          </Box>
        </Box>
      </Modal.Section>
    </Modal>
  );
}