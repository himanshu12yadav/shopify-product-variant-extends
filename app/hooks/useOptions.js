/**
 * useOptions Hook
 * 
 * Custom hook for managing product options state and operations.
 * Handles the transformation of server data to client state and provides
 * functions for manipulating options (toggle values, add/update/remove options).
 * 
 * @param {Array} loadedOptions - Initial options from server loader
 * @returns {Object} Options state and manipulation functions
 */

import { useState, useEffect, useCallback } from "react";

export function useOptions(loadedOptions = []) {
  const [options, setOptions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Transform database format to UI state format
   * @param {Array} serverOptions - Options from server/database
   * @returns {Array} Transformed options for UI
   */
  const transformOptions = useCallback((serverOptions) => {
    return serverOptions.map(option => ({
      id: option.id,
      name: option.name,
      type: option.type || "text", // Fallback to text for backward compatibility
      position: option.position || 0,
      isRequired: option.isRequired || true,
      values: option.values.map(value => ({
        name: value.value,        // Database field is 'value'
        checked: value.isActive,  // Database field is 'isActive'
        position: value.position || 0
      }))
    }));
  }, []);

  /**
   * Transform and set initial options when loaded from server
   * Always sync with server data when loadedOptions changes
   */
  useEffect(() => {
    if (loadedOptions && Array.isArray(loadedOptions)) {
      const transformedOptions = transformOptions(loadedOptions);
      setOptions(transformedOptions);
      setIsInitialized(true);
      console.log("Options synced from server:", transformedOptions);
    }
  }, [loadedOptions, transformOptions]);

  /**
   * Reset options state (useful for testing or manual refresh)
   */
  const resetOptions = useCallback(() => {
    setIsInitialized(false);
    setOptions([]);
  }, []);

  /**
   * Toggle the checked state of a specific value within an option
   * Used when user clicks on individual value checkboxes
   * 
   * @param {string} optionId - ID of the option containing the value
   * @param {string} valueNameToToggle - Name of the value to toggle
   */
  const handleToggleValueChecked = useCallback((optionId, valueNameToToggle) => {
    setOptions((currentOptions) => {
      return currentOptions.map((option) => {
        if (option.id === optionId) {
          return {
            ...option,
            values: option.values.map((v) =>
              v.name === valueNameToToggle ? { ...v, checked: !v.checked } : v,
            ),
          };
        }
        return option;
      });
    });
  }, []);

  /**
   * Toggle all values within an option (select all / deselect all)
   * If all values are checked, unchecks all. Otherwise, checks all.
   * 
   * @param {string} optionId - ID of the option to toggle all values for
   */
  const handleToggleAllValues = useCallback((optionId) => {
    setOptions((currentOptions) => {
      return currentOptions.map((option) => {
        if (option.id === optionId) {
          const allChecked = option.values.every((v) => v.checked);
          return {
            ...option,
            values: option.values.map((v) => ({ ...v, checked: !allChecked })),
          };
        }
        return option;
      });
    });
  }, []);

  /**
   * Add a new option to the options list
   * Used for optimistic updates when creating options
   * 
   * @param {Object} newOption - The new option object to add
   */
  const addOption = useCallback((newOption) => {
    if (!newOption || !newOption.id) {
      console.error("Invalid option object provided to addOption:", newOption);
      return;
    }
    
    setOptions((prevOptions) => {
      // Check if option already exists to prevent duplicates
      const existingOption = prevOptions.find(opt => opt.id === newOption.id);
      if (existingOption) {
        console.warn("Option already exists, updating instead:", newOption.id);
        return prevOptions.map(opt => opt.id === newOption.id ? newOption : opt);
      }
      return [...prevOptions, newOption];
    });
  }, []);

  /**
   * Update an existing option in the options list
   * Used for optimistic updates when editing options
   * 
   * @param {Object} updatedOption - The updated option object
   */
  const updateOption = useCallback((updatedOption) => {
    if (!updatedOption || !updatedOption.id) {
      console.error("Invalid option object provided to updateOption:", updatedOption);
      return;
    }

    setOptions((prevOptions) => {
      const optionExists = prevOptions.some(opt => opt.id === updatedOption.id);
      if (!optionExists) {
        console.warn("Option not found for update, adding instead:", updatedOption.id);
        return [...prevOptions, updatedOption];
      }
      
      return prevOptions.map((option) =>
        option.id === updatedOption.id ? updatedOption : option,
      );
    });
  }, []);

  /**
   * Remove multiple options from the options list
   * Used for delete operations with proper validation
   * 
   * @param {Array<string>|string} optionIds - Array of option IDs or single ID to remove
   */
  const removeOptions = useCallback((optionIds) => {
    // Ensure optionIds is always an array
    const idsArray = Array.isArray(optionIds) ? optionIds : [optionIds];
    
    if (!idsArray || idsArray.length === 0) {
      console.warn("No option IDs provided for removal");
      return;
    }

    setOptions((prevOptions) => {
      const filteredOptions = prevOptions.filter(option => !idsArray.includes(option.id));
      console.log(`Removed ${prevOptions.length - filteredOptions.length} options from state`);
      return filteredOptions;
    });
  }, []);

  /**
   * Get a specific option by ID
   * @param {string} optionId - The option ID to find
   * @returns {Object|null} The option object or null if not found
   */
  const getOption = useCallback((optionId) => {
    return options.find(option => option.id === optionId) || null;
  }, [options]);

  /**
   * Get options count
   * @returns {number} Number of options
   */
  const getOptionsCount = useCallback(() => {
    return options.length;
  }, [options.length]);

  return {
    // State
    options,
    isInitialized,
    
    // Actions
    setOptions,
    resetOptions,
    handleToggleValueChecked,
    handleToggleAllValues,
    addOption,
    updateOption,
    removeOptions,
    
    // Getters
    getOption,
    getOptionsCount
  };
}