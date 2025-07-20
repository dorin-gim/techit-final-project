import { toast, ToastOptions } from 'react-toastify';

// Default toast configuration
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  rtl: true,
  theme: "light",
};

// Success toast for cart operations
export const showCartSuccessToast = (productName: string, action: 'added' | 'removed' | 'updated') => {
  const messages = {
    added: `${productName} נוסף לעגלה בהצלחה! 🛒`,
    removed: `${productName} הוסר מהעגלה`,
    updated: `כמות ${productName} עודכנה`,
  };

  toast.success(messages[action], {
    ...defaultOptions,
  });
};

// Error toast for cart operations
export const showCartErrorToast = (message: string = "שגיאה בביצוע הפעולה") => {
  toast.error(message, {
    ...defaultOptions,
  });
};

// Info toast for cart operations
export const showCartInfoToast = (message: string) => {
  toast.info(message, {
    ...defaultOptions,
  });
};

// Warning toast
export const showWarningToast = (message: string) => {
  toast.warning(message, {
    ...defaultOptions,
  });
};

// Loading toast for async operations
export const showLoadingToast = (message: string = "מעבד...") => {
  return toast.loading(message, {
    ...defaultOptions,
    autoClose: false,
  });
};

// Update loading toast to success
export const updateToastToSuccess = (toastId: any, message: string) => {
  toast.update(toastId, {
    render: message,
    type: "success",
    isLoading: false,
    autoClose: 3000,
  });
};

// Update loading toast to error
export const updateToastToError = (toastId: any, message: string) => {
  toast.update(toastId, {
    render: message,
    type: "error",
    isLoading: false,
    autoClose: 3000,
  });
};