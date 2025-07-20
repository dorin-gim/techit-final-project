import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  addToCart as addToCartAPI, 
  getProductsFromCart,
  removeFromCart as removeFromCartAPI,
  updateCartItemQuantity,
  clearUserCart
} from '../services/cartsService';
import { Product } from '../interfaces/Product';

// Interface for cart item with quantity
export interface CartItem extends Product {
  quantity: number;
  productId: string;
}

// Cart state interface
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  isOpen: boolean; // For cart dropdown/modal
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  isOpen: false,
};

// Async thunks for API calls
export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProductsFromCart();
      return response || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'שגיאה בטעינת עגלת הקניות');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      await addToCartAPI(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'שגיאה בהוספה לעגלה');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      await removeFromCartAPI(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'שגיאה בהסרה מהעגלה');
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await updateCartItemQuantity(productId, quantity);
      return { productId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'שגיאה בעדכון כמות');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await clearUserCart();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'שגיאה בריקון העגלה');
    }
  }
);

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Toggle cart dropdown/modal
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    // Close cart
    closeCart: (state) => {
      state.isOpen = false;
    },
    
    // Open cart
    openCart: (state) => {
      state.isOpen = true;
    },
    
    // Add item to cart (local state only)
    addToCartLocal: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingItem = state.items.find(item => 
        item._id === product._id || item.productId === product._id
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...product,
          quantity: 1,
          productId: product._id as string,
        });
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
    
    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => 
        item._id !== action.payload && item.productId !== action.payload
      );
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
    
    // Update item quantity
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => 
        item._id === id || item.productId === id
      );
      
      if (item && quantity > 0) {
        item.quantity = quantity;
      } else if (item && quantity <= 0) {
        state.items = state.items.filter(item => 
          item._id !== id && item.productId !== id
        );
      }
      
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
    
    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart items
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        const cartItems = action.payload.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1,
          productId: item.productId || item._id,
        }));
        
        state.items = cartItems;
        
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Cart items loaded:', cartItems);
          console.log('Total items:', totals.totalItems);
        }
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        // After successful API call, we'll refetch the cart
        // This will be handled in the component
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Remove item from local state
        state.items = state.items.filter(item => 
          item._id !== action.payload && item.productId !== action.payload
        );
        
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update quantity
      .addCase(updateQuantityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, quantity } = action.payload;
        
        if (quantity === 0) {
          // Remove item if quantity is 0
          state.items = state.items.filter(item => 
            item._id !== productId && item.productId !== productId
          );
        } else {
          // Update quantity
          const item = state.items.find(item => 
            item._id === productId || item.productId === productId
          );
          if (item) {
            item.quantity = quantity;
          }
        }
        
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  toggleCart,
  closeCart,
  openCart,
  addToCartLocal,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearError,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotalItems = (state: { cart: CartState }) => state.cart.totalItems;
export const selectCartTotalPrice = (state: { cart: CartState }) => state.cart.totalPrice;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartIsOpen = (state: { cart: CartState }) => state.cart.isOpen;

// Export reducer
export default cartSlice.reducer;