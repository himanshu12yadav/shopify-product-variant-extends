import { useState } from "react";

export function useToast() {
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setToastActive(true);
  };

  const hideToast = () => {
    setToastActive(false);
  };

  return {
    toastActive,
    toastMessage,
    showToast,
    hideToast
  };
}