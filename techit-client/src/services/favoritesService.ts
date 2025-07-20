import axios from "axios";

const api: string = `${process.env.REACT_APP_API}/favorites`;

const getAuthHeaders = () => ({
  headers: {
    Authorization: JSON.parse(localStorage.getItem("token") as string),
  },
});

// Get all user favorites
export function getFavorites() {
  return axios.get(api, getAuthHeaders()).then(res => res.data);
}

// Add product to favorites
export function addToFavorites(productId: string) {
  return axios.post(api, { productId }, getAuthHeaders());
}

// Remove product from favorites
export function removeFromFavorites(productId: string) {
  return axios.delete(`${api}/${productId}`, getAuthHeaders());
}

// Check if product is in favorites
export function checkIfFavorite(productId: string) {
  return axios.get(`${api}/check/${productId}`, getAuthHeaders()).then(res => res.data.isFavorite);
}

// Get favorites statistics (admin only) - הוספה חדשה
export function getFavoritesStats() {
  return axios.get(`${api}/stats`, getAuthHeaders()).then(res => res.data);
}