/**
 * EditOptionModal Component
 * 
 * A modal dialog for editing existing product options. This modal allows users to:
 * - Modify the option name
 * - Add new values to the option
 * - Remove existing values by clicking on them
 * - View the option type (disabled for editing as it affects data structure)
 * 
 * Key Features:
 * - Populates form with existing option data when opened
 * - Validates that option has at least one value before submission
 * - Supports removing values by clicking on badges
 * - Resets form state properly when closed/reopened
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
import { useState, useEffect } from "react";

export default function EditOptionModal({
  active,           // Boolean - whether modal is open
  onClose,          // Function - called when modal should close
  onSubmit,         // Function - called when form is submitted
  isLoading,        // Boolean - whether form is currently submitting
  editingOption     // Object - the option being edited (null when modal closed)
}) {
  // Form state management
  const [editOptionName, setEditOptionName] = useState("");          // Name of the option being edited
  const [editOptionValues, setEditOptionValues] = useState([]);      // Array of value strings
  const [editCurrentValue, setEditCurrentValue] = useState("");      // Current value being typed
  const [editOptionType, setEditOptionType] = useState("text");      // Type of option (text, color, etc.)

  /**
   * Effect to populate form when modal opens with an option
   * Dependencies include 'active' to ensure form repopulates when reopening same option
   * This fixes the issue where values disappear on modal reopen
   */
  useEffect(() => {
    if (editingOption && active) {
      setEditOptionName(editingOption.name);
      setEditOptionValues(editingOption.values.map((v) => v.name)); // Extract just the names
      setEditOptionType(editingOption.type);
      setEditCurrentValue(""); // Reset the input field
    }
  }, [editingOption, active]);

  /**
   * Add a new value to the option's value list
   * Prevents duplicate values and clears the input field
   */
  const addEditValueToList = () => {
    if (editCurrentValue && !editOptionValues.includes(editCurrentValue)) {
      setEditOptionValues([...editOptionValues, editCurrentValue]);
      setEditCurrentValue(""); // Clear input after adding
    }
  };

  /**
   * Remove a value from the option's value list
   * This is called when a user clicks on a value badge
   * @param {string} valueToRemove - The value to remove from the list
   */
  const removeEditValue = (valueToRemove) => {
    setEditOptionValues(
      editOptionValues.filter((value) => value !== valueToRemove),
    );
  };

  /**
   * Handle form submission
   * Validates that we have required data before calling onSubmit
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate we have all required data
    if (editOptionName && editOptionValues.length > 0 && editingOption) {
      onSubmit({
        optionId: editingOption.id,
        optionName: editOptionName,
        values: editOptionValues,
        optionType: editOptionType,
        originalOption: editingOption // Pass original for comparison
      });
    }
  };

  /**
   * Handle modal close - reset all form state
   * This ensures clean state for next modal open
   */
  const handleClose = () => {
    setEditOptionName("");
    setEditOptionValues([]);
    setEditCurrentValue("");
    setEditOptionType("text");
    onClose();
  };

  return (
    <Modal
      open={active}
      onClose={handleClose}
      title={`Edit Option: ${editingOption?.name || ""}`}
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
                value={editOptionName}
                onChange={setEditOptionName}
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
                  label="Add New Values"
                  value={editCurrentValue}
                  onChange={setEditCurrentValue}
                  autoComplete="off"
                  placeholder="e.g., Red, Blue, Green"
                  helpText="Press Enter or click Add to add new values to this option"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEditValueToList();
                    }
                  }}
                  connectedRight={
                    <Button
                      onClick={addEditValueToList}
                      disabled={!editCurrentValue}
                    >
                      Add
                    </Button>
                  }
                />

                {editOptionValues.length > 0 && (
                  <Box paddingBlockStart="300">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <Text variant="bodySm" color="subdued">
                        All values ({editOptionValues.length}):
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
                          {editOptionValues.map((value, index) => (
                            <Badge
                              key={index}
                              tone="info"
                              onClick={() => removeEditValue(value)}
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
                value={editOptionType}
                onChange={setEditOptionType}
                options={[
                  { label: "📝 Text Input", value: "text" },
                  { label: "🔢 Number Input", value: "number" },
                  { label: "🖼️ Image Upload", value: "image" },
                  { label: "🎨 Color Picker", value: "color" },
                ]}
                helpText="Option type cannot be changed after creation"
                disabled
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
                disabled={!editOptionName || editOptionValues.length === 0}
                loading={isLoading}
              >
                {isLoading ? "Updating..." : "Update Option"}
              </Button>
            </div>
          </Box>
        </Box>
      </Modal.Section>
    </Modal>
  );
}