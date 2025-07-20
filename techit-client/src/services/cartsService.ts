import axios from "axios";
import { getProductById } from "./productsService";

const api: string = `${process.env.REACT_APP_API}/carts`;

// Get auth headers helper
const getAuthHeaders = () => ({
  headers: {
    Authorization: JSON.parse(localStorage.getItem("token") as string),
  },
});

// Create new cart for user
export function createCart(userId: string) {
  return axios.post(api, { userId, products: [], active: true }, getAuthHeaders());
}

// Get all products from user's cart with full product details
export async function getProductsFromCart() {
  try {
    // Get user's cart from server
    const cartResponse = await axios.get(api, getAuthHeaders());
    
    if (!cartResponse.data || cartResponse.data.length === 0) {
      return [];
    }
    
    // Return the cart items that already include product details
    return cartResponse.data.map((item: any) => ({
      ...item,
      _id: item._id || item.productId,
      productId: item.productId || item._id,
      quantity: item.quantity || 1,
    }));
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

// Add product to cart
export async function addToCart(productId: string) {
  try {
    const response = await axios.patch(api, { productId }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

// Remove product from cart
export async function removeFromCart(productId: string) {
  try {
    const response = await axios.delete(`${api}/${productId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

// Update product quantity in cart
export async function updateCartItemQuantity(productId: string, quantity: number) {
  try {
    const response = await axios.put(`${api}/${productId}`, { quantity }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
}

// Clear entire cart
export async function clearUserCart() {
  try {
    const response = await axios.delete(api, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

// Get cart total count (for badge)
export async function getCartItemCount() {
  try {
    const items = await getProductsFromCart();
    return items.reduce((total: number, item: any) => total + (item.quantity || 1), 0);
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}

// Check if product is in cart
export async function isProductInCart(productId: string) {
  try {
    const items = await getProductsFromCart();
    return items.some((item: any) => 
      item._id === productId || item.productId === productId
    );
  } catch (error) {
    console.error("Error checking if product in cart:", error);
    return false;
  }
}