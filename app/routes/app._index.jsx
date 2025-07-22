import {authenticate} from "../shopify.server.js";
import {json} from "@remix-run/node";
import { Page, Layout, Card, Text, Button, Modal, TextField, Select, FormLayout, ResourceList, ResourceItem, Badge, Checkbox, Box, Divider, EmptyState, Toast, Frame } from "@shopify/polaris";
import { PlusIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import Preview from "../components/preview.jsx";
import { useSubmit } from "@remix-run/react";
import { useState, useCallback } from "react";

export const loader = async ({request})=>{
  await authenticate.admin(request);
  return json({apiKey: process.env.SHOPIFY_API_KEY || ""});
}

export const action = async ({request})=>{
  await authenticate.admin(request);
  return null;
}

export default function Index(){
  const [modalActive, setModalActive] = useState(false);
  const [editModalActive, setEditModalActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [optionName, setOptionName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [optionValues, setOptionValues] = useState([]);
  const [currentValue, setCurrentValue] = useState("");
  const [optionType, setOptionType] = useState("text");
  const [expandedOptions, setExpandedOptions] = useState({});

  // Edit modal specific states
  const [editingOption, setEditingOption] = useState(null);
  const [editOptionName, setEditOptionName] = useState("");
  const [editOptionValues, setEditOptionValues] = useState([]);
  const [editCurrentValue, setEditCurrentValue] = useState("");
  const [editOptionType, setEditOptionType] = useState("text");

  // Product selection states
  const [productModalActive, setProductModalActive] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts] = useState([
    { id: 1, title: "Classic T-Shirt", handle: "classic-t-shirt", image: "https://via.placeholder.com/60x60" },
    { id: 2, title: "Premium Hoodie", handle: "premium-hoodie", image: "https://via.placeholder.com/60x60" },
    { id: 3, title: "Denim Jacket", handle: "denim-jacket", image: "https://via.placeholder.com/60x60" },
    { id: 4, title: "Running Shoes", handle: "running-shoes", image: "https://via.placeholder.com/60x60" },
    { id: 5, title: "Leather Wallet", handle: "leather-wallet", image: "https://via.placeholder.com/60x60" },
    { id: 6, title: "Wireless Headphones", handle: "wireless-headphones", image: "https://via.placeholder.com/60x60" },
    { id: 7, title: "Smartphone Case", handle: "smartphone-case", image: "https://via.placeholder.com/60x60" },
    { id: 8, title: "Cotton Dress", handle: "cotton-dress", image: "https://via.placeholder.com/60x60" },
    { id: 9, title: "Baseball Cap", handle: "baseball-cap", image: "https://via.placeholder.com/60x60" },
    { id: 10, title: "Laptop Bag", handle: "laptop-bag", image: "https://via.placeholder.com/60x60" }
  ]);

  const [options, setOptions] = useState([
    { id: 1, name: "Color", values: [
      { name: "Red", checked: true }, { name: "Blue", checked: true }, { name: "Green", checked: true }, { name: "Black", checked: true }, { name: "White", checked: true },
      { name: "Yellow", checked: true }, { name: "Orange", checked: true }, { name: "Purple", checked: true }, { name: "Pink", checked: true }, { name: "Gray", checked: true },
      { name: "Brown", checked: false }, { name: "Navy", checked: true }, { name: "Maroon", checked: false }, { name: "Teal", checked: true }, { name: "Lime", checked: false }
    ], type: "color" },
    { id: 2, name: "Size", values: [
      { name: "XS", checked: true }, { name: "Small", checked: true }, { name: "Medium", checked: true }, { name: "Large", checked: true }, { name: "XL", checked: true },
      { name: "XXL", checked: true }, { name: "XXXL", checked: true }, { name: "4XL", checked: false }, { name: "5XL", checked: false }, { name: "One Size", checked: true }
    ], type: "text" },
    { id: 3, name: "Material", values: [
      { name: "Cotton", checked: true }, { name: "Polyester", checked: true }, { name: "Wool", checked: true }, { name: "Silk", checked: true }, { name: "Linen", checked: true },
      { name: "Denim", checked: true }, { name: "Leather", checked: true }, { name: "Velvet", checked: false }, { name: "Satin", checked: false }, { name: "Canvas", checked: true },
      { name: "Fleece", checked: true }, { name: "Cashmere", checked: false }, { name: "Bamboo", checked: true }, { name: "Hemp", checked: false }, { name: "Spandex", checked: true }
    ], type: "text" },
    // ... rest of your options data
  ]);

  const toggleModal = useCallback(()=> setModalActive((active) => !active), []);
  const toggleEditModal = useCallback(()=> {
    setEditModalActive((active) => {
      if (active) {
        // Reset edit states when closing modal
        setEditingOption(null);
        setEditOptionName("");
        setEditOptionValues([]);
        setEditCurrentValue("");
        setEditOptionType("text");
      }
      return !active;
    });
  }, []);

  const toggleProductModal = useCallback(()=> setProductModalActive((active) => !active), []);

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleApplyOptionsToProducts = () => {
    if (selectedProducts.length === 0) {
      showToast("Please select at least one product to apply options to.");
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would make an API call here
      submit({
        actionType: 'Apply Options to Products',
        productIds: JSON.stringify(selectedProducts),
        optionIds: JSON.stringify(options.map(opt => opt.id))
      }, { method: "post" });

      const productNames = selectedProducts.map(id =>
        availableProducts.find(p => p.id === id)?.title
      ).join(', ');

      showToast(`Options applied successfully to ${selectedProducts.length} product(s): ${productNames.length > 50 ? productNames.substring(0, 50) + '...' : productNames}`);
      setSelectedProducts([]);
      // toggleProductModal();
    } catch (error) {
      showToast("Error applying options to products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open edit modal with selected option data
  const openEditModal = useCallback((option) => {
    console.log("Opening edit modal for option:", option); // Debug log
    setEditingOption(option);
    setEditOptionName(option.name);
    // Extract just the names from values array
    setEditOptionValues(option.values.map(v => v.name));
    setEditOptionType(option.type);
    setEditCurrentValue("");
    setEditModalActive(true);
  }, []);

  // New function to toggle option expansion
  const toggleOptionExpansion = useCallback((optionId) => {
    setExpandedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  }, []);

  const addValueToList = () => {
    if (currentValue && !optionValues.includes(currentValue)) {
      setOptionValues([...optionValues, currentValue]);
      setCurrentValue("");
    }
  };

  const removeValue = (valueToRemove) => {
    setOptionValues(optionValues.filter(value => value !== valueToRemove));
  };

  // Edit modal functions
  const addEditValueToList = () => {
    if (editCurrentValue && !editOptionValues.includes(editCurrentValue)) {
      setEditOptionValues([...editOptionValues, editCurrentValue]);
      setEditCurrentValue("");
    }
  };

  const removeEditValue = (valueToRemove) => {
    setEditOptionValues(editOptionValues.filter(value => value !== valueToRemove));
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (optionName && optionValues.length > 0) {
      setIsLoading(true);
      try {
        const newOption = {
          id: Date.now(),
          name: optionName,
          values: optionValues.map(v => ({ name: v, checked: true })),
          type: optionType
        };
        setOptions(prevOptions => [...prevOptions, newOption]);
        submit({actionType:'Add Option',optionSet:JSON.stringify({optionName, values: optionValues, optionType})}, {method: "post"});

        showToast(`Option "${optionName}" created successfully!`);
        setOptionName("");
        setOptionValues([]);
        setCurrentValue("");
        setOptionType("text");
        toggleModal();
      } catch (error) {
        showToast("Error creating option. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditOption = async (e) => {
    e.preventDefault();
    if (editOptionName && editOptionValues.length > 0 && editingOption) {
      setIsLoading(true);
      try {
        const updatedOption = {
          ...editingOption,
          name: editOptionName,
          values: editOptionValues.map(v => {
            // Preserve checked state for existing values, set new values to checked by default
            const existingValue = editingOption.values.find(ev => ev.name === v);
            return { name: v, checked: existingValue ? existingValue.checked : true };
          }),
          type: editOptionType
        };

        setOptions(prevOptions =>
          prevOptions.map(option =>
            option.id === editingOption.id ? updatedOption : option
          )
        );

        submit({actionType:'Edit Option', optionId: editingOption.id, optionSet:JSON.stringify({optionName: editOptionName, values: editOptionValues, optionType: editOptionType})}, {method: "post"});

        showToast(`Option "${editOptionName}" updated successfully!`);
        toggleEditModal(); // This will reset all edit states
      } catch (error) {
        showToast("Error updating option. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleValueChecked = (optionId, valueNameToToggle) => {
    setOptions(currentOptions => {
      return currentOptions.map(option => {
        if (option.id === optionId) {
          return {
            ...option,
            values: option.values.map(v =>
              v.name === valueNameToToggle ? { ...v, checked: !v.checked } : v
            ),
          };
        }
        return option;
      });
    });
  };

  const handleToggleAllValues = (optionId) => {
    setOptions(currentOptions => {
      return currentOptions.map(option => {
        if (option.id === optionId) {
          const allChecked = option.values.every(v => v.checked);
          return {
            ...option,
            values: option.values.map(v => ({ ...v, checked: !allChecked })),
          };
        }
        return option;
      });
    });
  };

  const handleBulkDelete = () => {
    const deletedCount = selectedItems.length;
    const newOptions = options.filter(option => !selectedItems.includes(option.id));
    setOptions(newOptions);
    showToast(`${deletedCount} option${deletedCount === 1 ? '' : 's'} deleted successfully`);
    setSelectedItems([]);
  };

  const promotedBulkActions = [{ content: 'Delete options', onAction: handleBulkDelete }];

  const submit = useSubmit();

  const showToast = (message) => {
    setToastMessage(message);
    setToastActive(true);
  };

  return (
    <Frame>
      {toastActive && (
        <Toast
          content={toastMessage}
          onDismiss={() => setToastActive(false)}
        />
      )}
      <Page title="Product Options Manager" fullWidth>
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <Box padding="500">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text variant="headingLg" as="h1">Product Options Manager</Text>
                  <Text variant="bodyMd" as="p" color="subdued">
                    Create and manage custom product options to enhance your store with additional fields and variations.
                  </Text>
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Button
                    primary
                    icon={PlusIcon}
                    onClick={toggleModal}
                    loading={isLoading}
                  >
                    Add New Option
                  </Button>
                  <Button
                    onClick={toggleProductModal}
                    disabled={options.length === 0}
                  >
                    Select Products ({selectedProducts.length})
                  </Button>
                  <Button
                    onClick={handleApplyOptionsToProducts}
                    disabled={selectedProducts.length === 0 || options.length === 0}
                    loading={isLoading}
                    tone="success"
                    type="button"
                  >
                    Apply Options
                  </Button>
                  <Text variant="bodySm" color="subdued">
                    {options.length} {options.length === 1 ? 'option' : 'options'} created
                  </Text>
                </div>
              </div>
            </Box>
          </Card>

          <Card>
            <Box padding="500">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="headingMd" as="h2">Current Options</Text>
                  <Badge tone="info">{options.length}</Badge>
                </div>
                {options.length === 0 ? (
                  <EmptyState
                    heading="No options created yet"
                    action={{
                      content: 'Add your first option',
                      onAction: toggleModal,
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <Text variant="bodyMd" as="p">
                      Start by creating product options to enhance your store.
                    </Text>
                  </EmptyState>
                ) : (
                  <ResourceList
                    resourceName={{singular: 'option', plural: 'options'}}
                    items={options}
                    selectable
                    selectedItems={selectedItems}
                    onSelectionChange={setSelectedItems}
                    promotedBulkActions={promotedBulkActions}
                    renderItem={(item) => {
                      const {id, name, values, type} = item;
                      const isExpanded = expandedOptions[id] || false;

                      return (
                        <ResourceItem id={id} accessibilityLabel={`View details for ${name}`}>
                          <Box padding="400">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Text variant="headingMd" as="h3">{name}</Text>
                                  <Badge tone={
                                    type === 'color' ? 'info' :
                                    type === 'number' ? 'success' :
                                    type === 'image' ? 'warning' : 'default'
                                  }>
                                    {type}
                                  </Badge>
                                  <Checkbox
                                    label="Select All"
                                    checked={values.every(v => v.checked)}
                                    indeterminate={values.some(v => v.checked) && !values.every(v => v.checked)}
                                    onChange={() => handleToggleAllValues(id)}
                                  />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Text variant="bodySm" color="subdued">
                                    {values.filter(v => v.checked).length} of {values.length} values active
                                  </Text>
                                  <Button
                                    variant="plain"
                                    size="slim"
                                    icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                                    onClick={() => toggleOptionExpansion(id)}
                                  >
                                    {isExpanded ? 'Collapse' : 'Expand'}
                                  </Button>
                                </div>
                                {isExpanded && (
                                  <Box paddingBlockStart="200">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                      {values.map((value) => (
                                        <Checkbox
                                          key={`${id}-${value.name}`}
                                          label={value.name}
                                          checked={value.checked}
                                          onChange={() => handleToggleValueChecked(id, value.name)}
                                        />
                                      ))}
                                    </div>
                                  </Box>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                  size="slim"
                                  icon={EditIcon}
                                  variant="tertiary"
                                  onClick={() => openEditModal(item)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </Box>
                        </ResourceItem>
                      );
                    }}
                  />
                )}
              </div>
            </Box>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Preview options={options} />
        </Layout.Section>
      </Layout>

      {/* Add New Option Modal */}
      <Modal
        open={modalActive}
        onClose={toggleModal}
        title="Add Product Option"
      >
        <Modal.Section>
          <Box padding="400">
            <FormLayout>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                  label="Option Name"
                  value={optionName}
                  onChange={setOptionName}
                  autoComplete="off"
                  placeholder="e.g., Color, Size, Material"
                  helpText="Enter a descriptive name for this product option"
                  requiredIndicator
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <TextField
                    label="Add Values"
                    value={currentValue}
                    onChange={setCurrentValue}
                    autoComplete="off"
                    placeholder="e.g., Red, Blue, Green"
                    helpText="Press Enter or click Add to create multiple options"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addValueToList();
                      }
                    }}
                    connectedRight={
                      <Button onClick={addValueToList} disabled={!currentValue}>
                        Add
                      </Button>
                    }
                  />
                  {optionValues.length > 0 && (
                    <Box paddingBlockStart="300">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Text variant="bodySm" color="subdued">Added values ({optionValues.length}):</Text>
                        <Box
                          background="bg-surface-secondary"
                          padding="300"
                          borderRadius="200"
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {optionValues.map((value, index) => (
                              <Badge
                                key={index}
                                tone="info"
                                onClick={() => removeValue(value)}
                                style={{ cursor: 'pointer' }}
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
                    { label: "🎨 Color Picker", value: "color" }
                  ]}
                  helpText="Choose how customers will interact with this option"
                />
              </div>
            </FormLayout>

            <Box paddingBlockStart="500">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={toggleModal} size="large">
                  Cancel
                </Button>
                <Button
                  primary
                  size="large"
                  onClick={handleAddOption}
                  disabled={!optionName || optionValues.length === 0}
                  loading={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Add Option'}
                </Button>
              </div>
            </Box>
          </Box>
        </Modal.Section>
      </Modal>

      {/* Edit Option Modal */}
      <Modal
        open={editModalActive}
        onClose={toggleEditModal}
        title={`Edit Option: ${editingOption?.name || ''}`}
      >
        <Modal.Section>
          <Box padding="400">
            <FormLayout>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                  label="Option Name"
                  value={editOptionName}
                  onChange={setEditOptionName}
                  autoComplete="off"
                  placeholder="e.g., Color, Size, Material"
                  helpText="Enter a descriptive name for this product option"
                  requiredIndicator
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <TextField
                    label="Add New Values"
                    value={editCurrentValue}
                    onChange={setEditCurrentValue}
                    autoComplete="off"
                    placeholder="e.g., Red, Blue, Green"
                    helpText="Press Enter or click Add to add new values to this option"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEditValueToList();
                      }
                    }}
                    connectedRight={
                      <Button onClick={addEditValueToList} disabled={!editCurrentValue}>
                        Add
                      </Button>
                    }
                  />

                  {editOptionValues.length > 0 && (
                    <Box paddingBlockStart="300">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Text variant="bodySm" color="subdued">All values ({editOptionValues.length}):</Text>
                        <Box
                          background="bg-surface-secondary"
                          padding="300"
                          borderRadius="200"
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {editOptionValues.map((value, index) => (
                              <Badge
                                key={index}
                                tone="info"
                                onClick={() => removeEditValue(value)}
                                style={{ cursor: 'pointer' }}
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
                    { label: "🎨 Color Picker", value: "color" }
                  ]}
                  helpText="Choose how customers will interact with this option"
                />
              </div>
            </FormLayout>

            <Box paddingBlockStart="500">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={toggleEditModal} size="large">
                  Cancel
                </Button>
                <Button
                  primary
                  size="large"
                  onClick={handleEditOption}
                  disabled={!editOptionName || editOptionValues.length === 0}
                  loading={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Option'}
                </Button>
              </div>
            </Box>
          </Box>
        </Modal.Section>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        open={productModalActive}
        onClose={toggleProductModal}
        title="Select Products to Apply Options"
        secondaryActions={[{
          content: 'Done',
          onAction: toggleProductModal
        }]}
      >
        <Modal.Section>
          <Box padding="400">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="headingMd">
                  Choose products to apply your {options.length} option{options.length !== 1 ? 's' : ''}
                </Text>
                <Badge tone="info">
                  {selectedProducts.length} selected
                </Badge>
              </div>

              <Box
                background="bg-surface-secondary"
                padding="300"
                borderRadius="200"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelection(product.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #000' : '1px solid #e1e1e1',
                          backgroundColor: isSelected ? '#f0f8ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleProductSelection(product.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text variant="bodyMd" fontWeight={isSelected ? "semibold" : "regular"}>
                            {product.title}
                          </Text>
                          <Text variant="bodySm" color="subdued">
                            {product.handle}
                          </Text>
                        </div>
                        {isSelected && (
                          <Badge tone="success">Selected</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Box>

              {selectedProducts.length > 0 && (
                <Box padding="300" background="bg-fill-tertiary" borderRadius="200">
                  <Text variant="bodySm" color="subdued">
                    <strong>Selected Products:</strong> {selectedProducts.map(id =>
                      availableProducts.find(p => p.id === id)?.title
                    ).join(', ')}
                  </Text>
                </Box>
              )}

              <Text variant="bodySm" color="subdued">
                Select products where you want to apply these custom options. All {options.length} option{options.length !== 1 ? 's' : ''} will be applied to the selected products.
              </Text>
            </div>
          </Box>
        </Modal.Section>
      </Modal>
      </Page>
    </Frame>
  );
}
