import { FunctionComponent, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/redux";
import { fetchCartItems } from "../store/cartSlice";

interface CartIconProps {
  className?: string;
}

const CartIcon: FunctionComponent<CartIconProps> = ({ className = "nav-link" }) => {
  const { totalItems, dispatch, loading } = useCart();

  //Load cart when component mounts

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(fetchCartItems());
    }
  }, [dispatch]);

  return (
    <Link
      className={`${className} position-relative`}
      to="/cart"
      title={`עגלת קניות - ${totalItems} פריטים`}
    >
      <i className="fas fa-shopping-cart me-1"></i>
      עגלה
      {totalItems > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{
            fontSize: "0.7rem",
            minWidth: "18px",
            height: "18px",
            lineHeight: "18px",
          }}
        >
          {totalItems > 99 ? "99+" : totalItems}
          <span className="visually-hidden">פריטים בעגלה</span>
        </span>
      )}
      {loading && (
        <span
          className="position-absolute top-0 start-100 translate-middle"
          style={{ fontSize: "0.6rem" }}
        >
          <i className="fas fa-spinner fa-spin text-info"></i>
        </span>
      )}
    </Link>
  );
};

export default CartIcon;