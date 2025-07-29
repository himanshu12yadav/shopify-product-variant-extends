/**
 * Product Options Manager - Main Route Component
 * 
 * This is the main page for managing product options in the Shopify app.
 * It handles creating, editing, and managing product options with different types
 * (text, number, image, color) and their associated values.
 * 
 * Key Features:
 * - Create new product options with multiple types
 * - Edit existing options and their values
 * - Preview how options will appear to customers
 * - Apply options to selected products
 * - Bulk operations on options
 */

import { authenticate } from "../shopify.server.js";
import { json } from "@remix-run/node";
import { createOptions, getOptions, updateOptions } from "../lib/shop.server.js";
import {
  Page,
  Layout,
  Toast,
  Frame,
} from "@shopify/polaris";
import Preview from "../components/preview.jsx";
import OptionsHeader from "../components/OptionsHeader.jsx";
import OptionsList from "../components/OptionsList.jsx";
import AddOptionModal from "../components/modals/AddOptionModal.jsx";
import EditOptionModal from "../components/modals/EditOptionModal.jsx";
import ProductSelectionModal from "../components/modals/ProductSelectionModal.jsx";
import { useOptions } from "../hooks/useOptions.js";
import { useModals } from "../hooks/useModals.js";
import { useToast } from "../hooks/useToast.js";
import { createOptionObject, updateOptionObject, prepareOptionForSubmit } from "../utils/optionUtils.js";
import { useSubmit, useLoaderData } from "@remix-run/react";
import { useState, useCallback } from "react";

/**
 * Loader function - Runs on the server before the page loads
 * 
 * Fetches all existing product options for the current shop from the database.
 * This data is available to the component via useLoaderData().
 * 
 * @param {Object} request - The incoming HTTP request
 * @returns {Object} JSON response with shop options and API key
 */
export const loader = async ({ request }) => {
  const admin = await authenticate.admin(request);
  
  try {
    // Fetch all options for this shop from the database
    const options = await getOptions(admin.session.shop);
    return json({ 
      apiKey: process.env.SHOPIFY_API_KEY || "",
      options: options || []
    });
  } catch (error) {
    console.error("Error loading options:", error);
    // Return empty array if there's an error loading options
    return json({ 
      apiKey: process.env.SHOPIFY_API_KEY || "",
      options: []
    });
  }
};

/**
 * Action function - Handles form submissions and server-side mutations
 * 
 * This function processes different types of actions (Add Option, Edit Option)
 * based on the actionType form field. All database mutations happen here.
 * 
 * @param {Object} request - The incoming HTTP request with form data
 * @returns {Object} JSON response indicating success/failure
 */
export const action = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const admin = await authenticate.admin(request);

  // Handle creating a new product option
  if (actionType === "Add Option") {
    const optionSet = JSON.parse(formData.get("optionSet"));
    const { optionName, values, optionType } = optionSet;
    
    try {
      // Create the option in the database with all its values
      const savedOption = await createOptions(admin.session.shop, {
        name: optionName,
        type: optionType, // e.g., "text", "color", "number", "image"
        values: values.map((value, index) => ({
          value,
          position: index,
          isActive: true
        }))
      });
      
      console.log("Option created successfully:", savedOption);
      return json({ success: true, option: savedOption });
    } catch (error) {
      console.error("Error creating option:", error);
      return json({ success: false, error: error.message }, { status: 500 });
    }
  }

  // Handle updating an existing product option
  if (actionType === "Edit Option") {
    const optionId = formData.get("optionId");
    const optionSet = JSON.parse(formData.get("optionSet"));
    const { optionName, values, optionType } = optionSet;
    
    try {
      // Update the option and replace all its values
      const updatedOption = await updateOptions(optionId, {
        name: optionName,
        type: optionType,
        values: values.map((value, index) => ({
          value,
          position: index,
          isActive: true
        }))
      });
      
      console.log("Option updated successfully:", updatedOption);
      return json({ success: true, option: updatedOption });
    } catch (error) {
      console.error("Error updating option:", error);
      return json({ success: false, error: error.message }, { status: 500 });
    }
  }

  return null;
};

/**
 * Main Component - Product Options Manager
 * 
 * This component manages the entire product options interface including:
 * - Displaying existing options
 * - Creating new options via modals
 * - Editing existing options
 * - Applying options to products
 * - Bulk operations
 */
export default function Index() {
  // Get initial data from the server loader
  const { options: loadedOptions = [] } = useLoaderData();
  const submit = useSubmit(); // Remix hook for form submissions
  
  // Custom hooks for state management
  const { options, handleToggleValueChecked, handleToggleAllValues, addOption, updateOption, removeOptions } = useOptions(loadedOptions);
  const { modalActive, editModalActive, productModalActive, toggleModal, toggleEditModal, toggleProductModal } = useModals();
  const { toastActive, toastMessage, showToast, hideToast } = useToast();
  
  // Local component state
  const [isLoading, setIsLoading] = useState(false); // Global loading state
  const [selectedItems, setSelectedItems] = useState([]); // Selected options for bulk operations
  const [expandedOptions, setExpandedOptions] = useState({}); // Which options are expanded in the list
  const [editingOption, setEditingOption] = useState(null); // Currently selected option for editing
  
  // Product selection states (for applying options to specific products)
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts] = useState([]); // TODO: Fetch from Shopify API

  /**
   * Toggle whether an option is expanded to show its values
   * @param {string} optionId - The ID of the option to toggle
   */
  const toggleOptionExpansion = useCallback((optionId) => {
    setExpandedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  }, []);

  /**
   * Handle selecting/deselecting products for applying options
   * @param {string} productId - The ID of the product to toggle
   */
  const handleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
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
      submit(
        {
          actionType: "Apply Options to Products",
          productIds: JSON.stringify(selectedProducts),
          optionIds: JSON.stringify(options.map((opt) => opt.id)),
        },
        { method: "post" },
      );

      const productNames = selectedProducts
        .map((id) => availableProducts.find((p) => p.id === id)?.title)
        .join(", ");

      showToast(
        `Options applied successfully to ${selectedProducts.length} product(s): ${productNames.length > 50 ? productNames.substring(0, 50) + "..." : productNames}`,
      );
      setSelectedProducts([]);
    } catch (error) {
      showToast("Error applying options to products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open the edit modal for a specific option
   * Sets the option to be edited and opens the modal
   * @param {Object} option - The option object to edit
   */
  const openEditModal = useCallback((option) => {
    setEditingOption(option);
    toggleEditModal();
  }, [toggleEditModal]);

  /**
   * Close the edit modal and clear the editing state
   * This ensures clean state when reopening the modal
   */
  const closeEditModal = useCallback(() => {
    toggleEditModal();
    setEditingOption(null); // Clear the editing option to ensure proper state reset
  }, [toggleEditModal]);

  /**
   * Handle creating a new product option
   * This function runs when the Add Option modal is submitted
   * 
   * @param {Object} optionData - The form data from the modal
   * @param {string} optionData.optionName - Name of the option (e.g., "Color")
   * @param {Array} optionData.values - Array of values (e.g., ["Red", "Blue"])
   * @param {string} optionData.optionType - Type of option (e.g., "color", "text")
   */
  const handleAddOption = async (optionData) => {
    setIsLoading(true);
    try {
      // Create option object for immediate UI update (optimistic update)
      const newOption = createOptionObject(optionData.optionName, optionData.values, optionData.optionType);
      addOption(newOption);
      
      // Submit to server to persist in database
      submit(
        {
          actionType: "Add Option",
          optionSet: JSON.stringify(prepareOptionForSubmit(optionData.optionName, optionData.values, optionData.optionType)),
        },
        { method: "post" },
      );

      showToast(`Option "${optionData.optionName}" created successfully!`);
      toggleModal();
    } catch (error) {
      showToast("Error creating option. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle editing an existing product option
   * This function runs when the Edit Option modal is submitted
   * 
   * @param {Object} editData - The form data from the edit modal
   * @param {string} editData.optionId - ID of the option being edited
   * @param {string} editData.optionName - Updated name of the option
   * @param {Array} editData.values - Updated array of values
   * @param {string} editData.optionType - Updated type of option
   * @param {Object} editData.originalOption - The original option object
   */
  const handleEditOption = async (editData) => {
    setIsLoading(true);
    try {
      // Update option object for immediate UI update (optimistic update)
      const updatedOption = updateOptionObject(editData.originalOption, editData.optionName, editData.values, editData.optionType);
      updateOption(updatedOption);

      // Submit to server to persist changes in database
      await submit(
        {
          actionType: "Edit Option",
          optionId: editData.optionId,
          optionSet: JSON.stringify(prepareOptionForSubmit(editData.optionName, editData.values, editData.optionType)),
        },
        { method: "post" },
      );

      showToast(`Option "${editData.optionName}" updated successfully!`);
      closeEditModal();
    } catch (error) {
      showToast("Error updating option. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle bulk deletion of selected options
   * Removes multiple options at once from the UI
   * TODO: Add server-side bulk delete functionality
   */
  const handleBulkDelete = () => {
    const deletedCount = selectedItems.length;
    removeOptions(selectedItems); // Remove from local state
    showToast(
      `${deletedCount} option${deletedCount === 1 ? "" : "s"} deleted successfully`,
    );
    setSelectedItems([]); // Clear selection
  };

  return (
    <Frame>
      {toastActive && (
        <Toast content={toastMessage} onDismiss={hideToast} />
      )}
      <Page title="Product Options Manager" fullWidth>
        <Layout>
          <Layout.Section variant="oneHalf">
            <OptionsHeader
              onAddOption={toggleModal}
              onSelectProducts={toggleProductModal}
              onApplyOptions={handleApplyOptionsToProducts}
              optionsCount={options.length}
              selectedProductsCount={selectedProducts.length}
              isLoading={isLoading}
            />

            <OptionsList
              options={options}
              expandedOptions={expandedOptions}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onToggleExpansion={toggleOptionExpansion}
              onToggleAllValues={handleToggleAllValues}
              onToggleValueChecked={handleToggleValueChecked}
              onEdit={openEditModal}
              onBulkDelete={handleBulkDelete}
              onAddOption={toggleModal}
            />
          </Layout.Section>
          <Layout.Section variant="oneHalf">
            <Preview options={options} />
          </Layout.Section>
        </Layout>

        <AddOptionModal
          active={modalActive}
          onClose={toggleModal}
          onSubmit={handleAddOption}
          isLoading={isLoading}
        />

        <EditOptionModal
          active={editModalActive}
          onClose={closeEditModal}
          onSubmit={handleEditOption}
          isLoading={isLoading}
          editingOption={editingOption}
        />

        <ProductSelectionModal
          active={productModalActive}
          onClose={toggleProductModal}
          options={options}
          selectedProducts={selectedProducts}
          availableProducts={availableProducts}
          onProductSelection={handleProductSelection}
        />
      </Page>
    </Frame>
  );
}
