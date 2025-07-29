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
