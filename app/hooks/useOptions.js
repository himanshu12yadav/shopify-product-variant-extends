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

import { useState, useEffect } from "react";

export function useOptions(loadedOptions = []) {
  const [options, setOptions] = useState([]);

  /**
   * Transform and set initial options when loaded from server
   * Converts database format to UI state format
   */
  useEffect(() => {
    if (loadedOptions.length > 0) {
      const transformedOptions = loadedOptions.map(option => ({
        id: option.id,
        name: option.name,
        type: option.type || "text", // Fallback to text for backward compatibility
        values: option.values.map(value => ({
          name: value.value,        // Database field is 'value'
          checked: value.isActive   // Database field is 'isActive'
        }))
      }));
      setOptions(transformedOptions);
    }
  }, [loadedOptions]);

  /**
   * Toggle the checked state of a specific value within an option
   * Used when user clicks on individual value checkboxes
   * 
   * @param {string} optionId - ID of the option containing the value
   * @param {string} valueNameToToggle - Name of the value to toggle
   */
  const handleToggleValueChecked = (optionId, valueNameToToggle) => {
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
  };

  /**
   * Toggle all values within an option (select all / deselect all)
   * If all values are checked, unchecks all. Otherwise, checks all.
   * 
   * @param {string} optionId - ID of the option to toggle all values for
   */
  const handleToggleAllValues = (optionId) => {
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
  };

  /**
   * Add a new option to the options list
   * Used for optimistic updates when creating options
   * 
   * @param {Object} newOption - The new option object to add
   */
  const addOption = (newOption) => {
    setOptions((prevOptions) => [...prevOptions, newOption]);
  };

  /**
   * Update an existing option in the options list
   * Used for optimistic updates when editing options
   * 
   * @param {Object} updatedOption - The updated option object
   */
  const updateOption = (updatedOption) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === updatedOption.id ? updatedOption : option,
      ),
    );
  };

  /**
   * Remove multiple options from the options list
   * Used for bulk delete operations
   * 
   * @param {Array<string>} optionIds - Array of option IDs to remove
   */
  const removeOptions = (optionIds) => {
    setOptions(options.filter(option => !optionIds.includes(option.id)));
  };

  return {
    options,
    setOptions,
    handleToggleValueChecked,
    handleToggleAllValues,
    addOption,
    updateOption,
    removeOptions
  };
}