import { FunctionComponent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Layout from "./Layout";
import { Product } from "../interfaces/Product";
import { getProductById } from "../services/productsService";
import FavoriteButton from "./FavoriteButton";
import { getPayloadFromToken } from "../services/usersService";
import { useCart } from "../hooks/redux";
import { addToCartAsync, addToCartLocal, fetchCartItems } from "../store/cartSlice";

interface ProductDetailsProps {}

const ProductDetails: FunctionComponent<ProductDetailsProps> = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Redux cart hook
  const { dispatch, loading: cartLoading } = useCart();

  useEffect(() => {
    //  Check if admin
    if (localStorage.getItem("token")) {
      try {
        const payload = getPayloadFromToken();
        setIsAdmin(payload.isAdmin);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      setError("מזהה מוצר לא תקין");
      setLoading(false);
      return;
    }

    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductById(productId as string);
      setProduct(response.data);
    } catch (err: any) {
      console.error("Error loading product:", err);
      setError("שגיאה בטעינת המוצר");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!product.available) {
      toast.error("המוצר אינו זמין כעת");
      return;
    }

    try {
      // Add to cart in local mode immediately for good UX
      dispatch(addToCartLocal(product));
      toast.success(`${product.name} נוסף לעגלה!`);

      // Send to server in background
      await dispatch(addToCartAsync(product._id as string)).unwrap();

      // Refresh the cart from the server
      dispatch(fetchCartItems());
    } catch (error: any) {
      toast.error(error || "שגיאה בהוספה לעגלה");
    }
  };

  const handleBackToProducts = () => {
    navigate("/products");
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Add to cart and go to shopping cart page
    await handleAddToCart();
    setTimeout(() => {
      navigate("/cart");
    }, 500); 
  };

  if (loading) {
    return (
      <Layout title="טוען מוצר...">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-3 text-muted">טוען פרטי מוצר...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout title="שגיאה">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
          <h4 className="text-muted">{error || "מוצר לא נמצא"}</h4>
          <p className="text-muted">לא הצלחנו למצוא את המוצר שחיפשת</p>
          <button className="btn btn-primary" onClick={handleBackToProducts}>
            <i className="fas fa-arrow-right me-2"></i>
            חזור לרשימת המוצרים
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={product.name}>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button className="btn btn-link p-0 text-decoration-none" onClick={handleBackToProducts}>
              מוצרים
            </button>
          </li>
          <li className="breadcrumb-item">
            <span className="text-muted">{product.category}</span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="position-relative">
              <img
                src={product.image}
                className="card-img-top"
                alt={`תמונה של ${product.name}`}
                style={{ height: "450px", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/450x450?text=תמונה+לא+זמינה";
                }}
              />
              {!product.available && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
                  <span className="badge bg-danger fs-4 p-3">אזל מהמלאי</span>
                </div>
              )}
              
              <div className="position-absolute top-0 end-0 m-3">
                <span className={`badge fs-6 p-2 ${product.available ? "bg-success" : "bg-danger"}`}>
                  <i className={`fas ${product.available ? "fa-check-circle" : "fa-times-circle"} me-1`}></i>
                  {product.available ? "זמין במלאי" : "אזל מהמלאי"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                פרטי המוצר
              </h5>
            </div>
            <div className="card-body">
              <h1 className="card-title text-primary mb-3 display-6">{product.name}</h1>

              <div className="mb-3">
                <span className="badge bg-info fs-6 p-2">
                  <i className="fas fa-tag me-1"></i>
                  {product.category}
                </span>
              </div>

              <div className="mb-4 p-3 bg-light rounded">
                <h2 className="text-success mb-1 display-5">
                  <i className="fas fa-shekel-sign me-2"></i>
                  {product.price.toLocaleString()}
                </h2>
                <small className="text-muted">מחיר כולל מע"ם | משלוח חינם</small>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-2">
                  <i className="fas fa-align-right me-2 text-info"></i>
                  תיאור המוצר:
                </h6>
                <p className="text-muted lh-lg">{product.description}</p>
              </div>

              {isAdmin && (
                <div className="mb-4 p-2 bg-warning bg-opacity-10 rounded">
                  <h6 className="fw-bold mb-1">
                    <i className="fas fa-boxes me-2 text-warning"></i>
                    מידע מנהל:
                  </h6>
                  <small className="text-muted">
                    כמות במלאי: <span className="fw-bold">{product.quantity || 0} יחידות</span>
                  </small>
                </div>
              )}

              <div className="d-grid gap-2">
                <button
                  className="btn btn-success btn-lg py-3"
                  onClick={handleBuyNow}
                  disabled={!product.available || cartLoading}
                >
                  {cartLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      מעבד...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt me-2"></i>
                      קנה עכשיו
                    </>
                  )}
                </button>
                
                <div className="row g-2">
                  <div className="col-8">
                    <button
                      className="btn btn-primary w-100 py-2"
                      onClick={handleAddToCart}
                      disabled={!product.available || cartLoading}
                    >
                      {cartLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          מוסיף...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-cart-plus me-2"></i>
                          {product.available ? "הוסף לעגלה" : "אזל מהמלאי"}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="col-4">
                    <FavoriteButton 
                      productId={product._id as string}
                      className="btn btn-outline-danger w-100 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-gift me-2"></i>
                יתרונות הקנייה אצלנו
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className="d-flex flex-column align-items-center">
                    <i className="fas fa-truck fa-2x text-info mb-2"></i>
                    <h6 className="fw-bold">משלוח חינם</h6>
                    <small className="text-muted">לכל הארץ</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="d-flex flex-column align-items-center">
                    <i className="fas fa-shield-alt fa-2x text-success mb-2"></i>
                    <h6 className="fw-bold">אחריות יצרן</h6>
                    <small className="text-muted">2 שנים מלאות</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="d-flex flex-column align-items-center">
                    <i className="fas fa-undo fa-2x text-warning mb-2"></i>
                    <h6 className="fw-bold">החזרה</h6>
                    <small className="text-muted">30 יום</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="d-flex flex-column align-items-center">
                    <i className="fas fa-headset fa-2x text-primary mb-2"></i>
                    <h6 className="fw-bold">תמיכה</h6>
                    <small className="text-muted">24/7</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-star text-warning me-2"></i>
                מוצרים דומים שעשויים לעניין אותך
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-2">
                    <i className="fas fa-lightbulb me-2"></i>
                    רוצה לראות מוצרים דומים בקטגוריה "{product.category}"?
                  </p>
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)}
                  >
                    <i className="fas fa-search me-2"></i>
                    צפה במוצרים דומים
                  </button>
                </div>
                <div className="text-center">
                  <i className="fas fa-boxes fa-3x text-muted opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed-bottom p-3 d-block d-md-none">
        <button 
          className="btn btn-secondary w-100" 
          onClick={handleBackToProducts}
        >
          <i className="fas fa-arrow-right me-2"></i>
          חזור לרשימת המוצרים
        </button>
      </div>

      <style>{`
        .breadcrumb-item + .breadcrumb-item::before {
          content: "←";
          color: #6c757d;
        }
        
        .display-6 {
          font-size: 2rem;
          font-weight: 600;
        }
        
        .display-5 {
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        @media (max-width: 768px) {
          .display-6 {
            font-size: 1.5rem;
          }
          
          .display-5 {
            font-size: 2rem;
          }
          
          .card-img-top {
            height: 300px !important;
          }
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .card {
          transition: transform 0.2s ease-in-out;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </Layout>
  );
};

export default ProductDetails;