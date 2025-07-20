import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import store from "./store/store";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

// Import auto logout service
import autoLogoutService from "./services/autoLogoutService";

import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import Profile from "./components/Profile";
import PageNotFound from "./components/PageNotFound";
import Products from "./components/Products";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import About from "./components/About";
import Favorites from "./components/Favorites";
// Import admin components
import UsersManagement from "./components/UsersManagement";
import FavoritesStats from "./components/FavoritesStats";

function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>();

  useEffect(() => {
    try {
      if (localStorage.getItem("token")) {
        // Auto logout service starts automatically
      }
    } catch (error) {
      localStorage.removeItem("token");
    }
  }, []);

  // Add cleanup when app closes
  useEffect(() => {
    return () => {
      autoLogoutService.cleanup();
    };
  }, []);

  useEffect(() => {
    document.body.setAttribute("dir", "rtl");
    document.body.setAttribute("lang", "he");
  }, []);

  return (
    <Provider store={store}>
      <div
        className="App"
        role="application"
        aria-label="TechIt - Technology Store App"
      >
        <Router>
          <main id="main-content" role="main">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route
                path="/admin/favorites-stats"
                element={<FavoritesStats />}
              />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
        </Router>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          role="alert"
          aria-live="polite"
          aria-label="System notifications"
        />

        <div
          id="live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        ></div>
      </div>
    </Provider>
  );
}

export default App;
