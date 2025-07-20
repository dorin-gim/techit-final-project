import { FunctionComponent, useEffect, useState } from "react";
import { NavigateFunction, NavLink, useNavigate } from "react-router-dom";
import CartIcon from "./CartIcon";
import { getPayloadFromToken } from "../services/usersService";

interface NavbarProps {}

const Navbar: FunctionComponent<NavbarProps> = () => {
  const navigate: NavigateFunction = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      try {
        const payload = getPayloadFromToken();
        setIsAdmin(payload.isAdmin);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg bg-dark text-light"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <NavLink className="navbar-brand text-info" to="/home">
            <i className="fas fa-laptop me-2"></i>
            TechIt
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/home">
                  <i className="fas fa-home me-1"></i>
                  בית
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to="/products"
                >
                  <i className="fas fa-box me-1"></i>
                  מוצרים
                </NavLink>
              </li>
              <li className="nav-item">
                <CartIcon />
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to="/favorites"
                >
                  <i className="fas fa-heart me-1"></i>
                  מועדפים
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/about">
                  <i className="fas fa-info-circle me-1"></i>
                  אודות
                </NavLink>
              </li>

              {isAdmin && (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-cog me-1"></i>
                    ניהול
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <NavLink className="dropdown-item" to="/admin/users">
                        <i className="fas fa-users me-2"></i>
                        ניהול משתמשים
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        className="dropdown-item"
                        to="/admin/favorites-stats"
                      >
                        <i className="fas fa-chart-bar me-2"></i>
                        סטטיסטיקות מועדפים
                      </NavLink>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <span className="dropdown-item-text">
                        <i className="fas fa-crown text-warning me-2"></i>
                        <small>הרשאות מנהל</small>
                      </span>
                    </li>
                  </ul>
                </li>
              )}

              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/profile">
                  <i className="fas fa-user me-1"></i>
                  פרופיל
                  {isAdmin && (
                    <span className="badge bg-warning text-dark ms-2">
                      <i
                        className="fas fa-crown"
                        style={{ fontSize: "0.7rem" }}
                      ></i>
                    </span>
                  )}
                </NavLink>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <button
                className="btn btn-outline-info"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                התנתק
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
