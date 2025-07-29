/**
 * Option Utility Functions
 * 
 * These functions handle the transformation and manipulation of option objects
 * between different parts of the application (UI state, database, forms).
 */

/**
 * Create a new option object for the UI state
 * Used when adding a new option for immediate UI update (optimistic update)
 * 
 * @param {string} optionName - Name of the option (e.g., "Color")
 * @param {Array<string>} values - Array of value strings (e.g., ["Red", "Blue"])
 * @param {string} optionType - Type of option (e.g., "color", "text")
 * @returns {Object} Option object formatted for UI state
 */
export const createOptionObject = (optionName, values, optionType) => ({
  id: Date.now(), // Temporary ID for optimistic updates
  name: optionName,
  values: values.map((v) => ({ name: v, checked: true })), // All new values start as active
  type: optionType,
});

/**
 * Update an existing option object while preserving checked states
 * Used when editing an option - maintains the checked state of existing values
 * 
 * @param {Object} originalOption - The original option object
 * @param {string} optionName - Updated name of the option
 * @param {Array<string>} values - Updated array of value strings
 * @param {string} optionType - Updated type of option
 * @returns {Object} Updated option object for UI state
 */
export const updateOptionObject = (originalOption, optionName, values, optionType) => ({
  ...originalOption,
  name: optionName,
  values: values.map((v) => {
    // Find if this value existed before to preserve its checked state
    const existingValue = originalOption.values.find((ev) => ev.name === v);
    return {
      name: v,
      checked: existingValue ? existingValue.checked : true, // New values default to checked
    };
  }),
  type: optionType,
});

/**
 * Transform database options to UI state format
 * Converts options from database format to the format expected by UI components
 * 
 * @param {Array<Object>} loadedOptions - Options from database
 * @returns {Array<Object>} Options formatted for UI state
 */
export const transformLoadedOptions = (loadedOptions) => {
  return loadedOptions.map(option => ({
    id: option.id,
    name: option.name,
    type: option.type || "text", // Default to text if type is missing
    values: option.values.map(value => ({
      name: value.value,        // Database uses 'value', UI uses 'name'
      checked: value.isActive   // Database uses 'isActive', UI uses 'checked'
    }))
  }));
};

/**
 * Prepare option data for server submission
 * Formats option data for the server action function
 * 
 * @param {string} optionName - Name of the option
 * @param {Array<string>} values - Array of value strings
 * @param {string} optionType - Type of option
 * @returns {Object} Data formatted for server submission
 */
export const prepareOptionForSubmit = (optionName, values, optionType) => ({
  optionName,
  values,
  optionType
});