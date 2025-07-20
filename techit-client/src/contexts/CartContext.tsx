import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '../interfaces/Product';

// Types
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SYNC_FROM_SERVER'; payload: CartItem[] };

// Initial State
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === action.payload._id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // עדכון כמות של מוצר קיים
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1, addedAt: new Date() }
            : item
        );
      } else {
        // הוספת מוצר חדש
        newItems = [
          ...state.items,
          {
            product: action.payload,
            quantity: 1,
            addedAt: new Date(),
          },
        ];
      }

      const newTotal = calculateTotal(newItems);
      const newItemCount = calculateItemCount(newItems);

      // שמירה ב-localStorage
      saveCartToStorage(newItems);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        error: null,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => item.product._id !== action.payload
      );
      
      const newTotal = calculateTotal(newItems);
      const newItemCount = calculateItemCount(newItems);

      // שמירה ב-localStorage
      saveCartToStorage(newItems);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        error: null,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // אם הכמות 0 או פחות, הסר את המוצר
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: productId });
      }

      const newItems = state.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity, addedAt: new Date() }
          : item
      );

      const newTotal = calculateTotal(newItems);
      const newItemCount = calculateItemCount(newItems);

      // שמירה ב-localStorage
      saveCartToStorage(newItems);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        error: null,
      };
    }

    case 'CLEAR_CART': {
      // מחיקה מ-localStorage
      localStorage.removeItem('cart_items');
      
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        error: null,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    }

    case 'LOAD_CART': {
      const items = action.payload;
      const total = calculateTotal(items);
      const itemCount = calculateItemCount(items);

      return {
        ...state,
        items,
        total,
        itemCount,
        isLoading: false,
        error: null,
      };
    }

    case 'SYNC_FROM_SERVER': {
      const items = action.payload;
      const total = calculateTotal(items);
      const itemCount = calculateItemCount(items);

      // שמירה ב-localStorage
      saveCartToStorage(items);

      return {
        ...state,
        items,
        total,
        itemCount,
        isLoading: false,
        error: null,
      };
    }

    default:
      return state;
  }
};

// Helper Functions
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const saveCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem('cart_items', JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('cart_items');
    if (saved) {
      const items = JSON.parse(saved);
      // המרת תאריכים חזרה ל-Date objects
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      }));
    }
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
  }
  return [];
};

// Context
interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  syncWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // טעינה מ-localStorage בטעינה ראשונה
  useEffect(() => {
    const savedItems = loadCartFromStorage();
    if (savedItems.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: savedItems });
    }
  }, []);

  // סנכרון עם השרת בטעינה (אופציונלי)
  useEffect(() => {
    if (localStorage.getItem('token')) {
      syncWithServer();
    }
  }, []);

  const addItem = (product: Product) => {
    if (!product.available) {
      dispatch({ type: "SET_ERROR", payload: "מוצר זה אינו זמין כרגע" });
      return;
    }

    dispatch({ type: "ADD_ITEM", payload: product });

    // Display success message
    showSuccessNotification(`${product.name} נוסף לעגלה`);
  };

  const removeItem = (productId: string) => {
    const item = state.items.find(item => item.product._id === productId);
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    
    if (item) {
      showSuccessNotification(`${item.product.name} הוסר מהעגלה`);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    showSuccessNotification('העגלה נוקתה');
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.product._id === productId);
  };

  const syncWithServer = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // כאן ניתן להוסיף קריאה לשרת לסנכרון העגלה
      // const serverCart = await getCartFromServer();
      // dispatch({ type: 'SYNC_FROM_SERVER', payload: serverCart });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'שגיאה בסנכרון העגלה' });
    }
  };

  const showSuccessNotification = (message: string) => {
    // יצירת התראה
    const notification = document.createElement('div');
    notification.className = 'cart-notification position-fixed';
    notification.style.cssText = `
      top: 80px; right: 20px; z-index: 9999; 
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white; padding: 1rem 1.5rem; border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      font-weight: 500; min-width: 250px;
      animation: slideInRight 0.3s ease-out forwards;
    `;
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-cart-plus me-2"></i>
        ${message}
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  };

  const contextValue: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    syncWithServer,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};