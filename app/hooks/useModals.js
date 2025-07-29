/**
 * useModals Hook
 * 
 * Custom hook for managing modal states throughout the application.
 * Provides boolean states and toggle functions for different modal types.
 * Uses useCallback to prevent unnecessary re-renders of components that depend on these functions.
 * 
 * @returns {Object} Modal states and toggle functions
 */

import { useState, useCallback } from "react";

export function useModals() {
  // Modal state management
  const [modalActive, setModalActive] = useState(false);           // Add Option modal
  const [editModalActive, setEditModalActive] = useState(false);   // Edit Option modal  
  const [productModalActive, setProductModalActive] = useState(false); // Product Selection modal

  /**
   * Toggle the Add Option modal
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const toggleModal = useCallback(
    () => setModalActive((active) => !active),
    [],
  );

  /**
   * Toggle the Edit Option modal
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const toggleEditModal = useCallback(() => {
    setEditModalActive((active) => !active);
  }, []);

  /**
   * Toggle the Product Selection modal
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const toggleProductModal = useCallback(
    () => setProductModalActive((active) => !active),
    [],
  );

  return {
    // Modal states
    modalActive,        // Boolean - Add Option modal open state
    editModalActive,    // Boolean - Edit Option modal open state
    productModalActive, // Boolean - Product Selection modal open state
    
    // Toggle functions
    toggleModal,        // Function - Toggle Add Option modal
    toggleEditModal,    // Function - Toggle Edit Option modal
    toggleProductModal  // Function - Toggle Product Selection modal
  };
}