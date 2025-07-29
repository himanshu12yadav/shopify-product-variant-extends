/**
 * Server-side Database Operations for Product Options
 * 
 * These functions handle direct database operations for product options.
 * They interact with the Prisma ORM to perform CRUD operations on the database.
 * All functions are async and handle their own error logging.
 */

import prisma from "../db.server.js";

/**
 * Create a new product option in the database
 * Creates both the option and all its associated values in a single transaction
 * 
 * @param {string} shop - The shop identifier (from Shopify session)
 * @param {Object} optionData - The option data to create
 * @param {string} optionData.name - Name of the option (e.g., "Color")
 * @param {string} optionData.type - Type of option (e.g., "color", "text", "number", "image")
 * @param {number} optionData.position - Display order position (default: 0)
 * @param {boolean} optionData.isRequired - Whether option is required (default: true)
 * @param {Array} optionData.values - Array of value objects or strings
 * @returns {Object} The created option with its values included
 * @throws {Error} If database operation fails
 */
export const createOptions = async (shop, optionData) => {
  try {
    const { name, type = "text", position = 0, isRequired = true, values = [] } = optionData;

    // Create the variant option with its values in a single transaction
    const variantOption = await prisma.variantOption.create({
      data: {
        name,
        type, // Stores the option type (text, color, number, image)
        position,
        isRequired,
        shop, // Links option to specific shop
        values: {
          create: values.map((value, index) => ({
            value: value.value || value, // Handle both string and object formats
            position: value.position || index,
            isActive: value.isActive !== undefined ? value.isActive : true,
          })),
        },
      },
      include: {
        values: true, // Include the created values in the response
      },
    });

    return variantOption;
  } catch (error) {
    console.error("Error creating variant option:", error);
    throw error; // Re-throw to be handled by calling function
  }
};

/**
 * Retrieve all product options for a specific shop
 * Returns options with their values, ordered by position
 * 
 * @param {string} shop - The shop identifier (from Shopify session)
 * @returns {Array} Array of option objects with their values included
 * @throws {Error} If database query fails
 */
export const getOptions = async (shop) => {
  try {
    const options = await prisma.variantOption.findMany({
      where: {
        shop, // Filter options by shop
      },
      include: {
        values: {
          orderBy: {
            position: 'asc', // Order values by their position
          },
        },
      },
      orderBy: {
        position: 'asc', // Order options by their position
      },
    });

    return options;
  } catch (error) {
    console.error("Error fetching variant options:", error);
    throw error; // Re-throw to be handled by calling function
  }
};

/**
 * Update an existing product option in the database
 * Replaces all existing values with new ones (delete + create pattern)
 * This ensures clean updates without orphaned values
 * 
 * @param {string} optionId - The ID of the option to update
 * @param {Object} optionData - The updated option data
 * @param {string} optionData.name - Updated name of the option
 * @param {string} optionData.type - Updated type of option (default: "text")
 * @param {Array} optionData.values - New array of values to replace existing ones
 * @returns {Object} The updated option with its new values included
 * @throws {Error} If database operation fails
 */
export const updateOptions = async (optionId, optionData) => {
  try {
    const { name, type = "text", values = [] } = optionData;

    // First, delete all existing values for this option
    // This ensures we don't have orphaned values after update
    await prisma.variantOptionValue.deleteMany({
      where: {
        variantOptionId: optionId,
      },
    });

    // Update the variant option and create new values in a single transaction
    const updatedOption = await prisma.variantOption.update({
      where: {
        id: optionId,
      },
      data: {
        name,
        type, // Update the option type
        values: {
          create: values.map((value, index) => ({
            value: value.value || value, // Handle both string and object formats
            position: value.position || index,
            isActive: value.isActive !== undefined ? value.isActive : true,
          })),
        },
      },
      include: {
        values: true, // Include the new values in the response
      },
    });

    return updatedOption;
  } catch (error) {
    console.error("Error updating variant option:", error);
    throw error; // Re-throw to be handled by calling function
  }
};

/**
 * Deletes one or more product options from the database.
 * The `onDelete: Cascade` in the Prisma schema ensures that all related
 * `VariantOptionValue` records are also deleted automatically.
 *
 * @param {string|string[]} optionIds - An option ID or array of option IDs to delete.
 * @param {string} shop - The shop identifier to ensure we only delete options belonging to this shop.
 * @returns {Object} Result object with success status and deleted count.
 * @throws {Error} If the database operation fails.
 */
export const deleteOptions = async (optionIds, shop) => {
  try {
    // Ensure optionIds is always an array
    const idsArray = Array.isArray(optionIds) ? optionIds : [optionIds];
    
    // Validate input
    if (!idsArray || idsArray.length === 0) {
      throw new Error("No option IDs provided for deletion");
    }

    if (!shop) {
      throw new Error("Shop identifier is required for deletion");
    }

    // First, verify that all options belong to this shop for security
    const existingOptions = await prisma.variantOption.findMany({
      where: {
        id: { in: idsArray },
        shop: shop
      },
      select: { id: true, name: true }
    });

    if (existingOptions.length !== idsArray.length) {
      const foundIds = existingOptions.map(opt => opt.id);
      const notFoundIds = idsArray.filter(id => !foundIds.includes(id));
      throw new Error(`Some options not found or don't belong to this shop: ${notFoundIds.join(', ')}`);
    }

    // Delete the options (cascade will handle related values)
    const deletedResult = await prisma.variantOption.deleteMany({
      where: {
        id: { in: idsArray },
        shop: shop // Extra security - ensure we only delete from current shop
      },
    });

    console.log(`Successfully deleted ${deletedResult.count} options:`, existingOptions.map(opt => opt.name).join(', '));
    
    return {
      success: true,
      count: deletedResult.count,
      deletedOptions: existingOptions
    };
  } catch (error) {
    console.error("Error deleting variant options:", error);
    throw new Error(`Failed to delete options: ${error.message}`);
  }
};
