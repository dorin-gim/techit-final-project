import { FunctionComponent, useEffect } from "react";
import { toast } from 'react-toastify';
import Layout from "./Layout";
import { useCart } from "../hooks/redux";
import { 
  fetchCartItems, 
  removeFromCartAsync, 
  updateQuantityAsync, 
  clearCartAsync,
  clearError 
} from "../store/cartSlice";

interface CartProps {}

const Cart: FunctionComponent<CartProps> = () => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    loading, 
    error, 
    dispatch 
  } = useCart();

  useEffect(() => {
    // Load cart items when component mounts
    dispatch(fetchCartItems());
  }, [dispatch]);

  useEffect(() => {
    // Display errors using toast
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      await dispatch(removeFromCartAsync(productId)).unwrap();
      toast.success(`${productName} הוסר מהעגלה`);
    } catch (error) {
      toast.error('שגיאה בהסרת המוצר מהעגלה');
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    try {
      await dispatch(updateQuantityAsync({ productId, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error('שגיאה בעדכון הכמות');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("האם אתה בטוח שברצונך לרוקן את העגלה?")) {
      try {
        await dispatch(clearCartAsync()).unwrap();
        toast.success("העגלה רוקנה בהצלחה");
      } catch (error) {
        toast.error('שגיאה בריקון העגלה');
      }
    }
  };

  const handleCheckout = () => {
    toast.info("תכונת תשלום תתווסף בקרוב!");
  };

  if (loading) {
    return (
      <Layout title="עגלת הקניות שלי">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-3 text-muted">טוען עגלת קניות...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="עגלת הקניות שלי">
      {items.length > 0 ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-0">
                <i className="fas fa-shopping-cart me-2 text-info"></i>
                יש לך {totalItems} פריטים בעגלה
              </h5>
            </div>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleClearCart}
              title="רוקן עגלה"
            >
              <i className="fas fa-trash me-1"></i>
              רוקן עגלה
            </button>
          </div>

          <div className="row">
            <div className="col-lg-8">
              {items.map((item) => (
                <div key={item._id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ height: "80px", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80?text=תמונה";
                          }}
                        />
                      </div>

                      <div className="col-md-4">
                        <h6 className="card-title mb-1">{item.name}</h6>
                        <small className="text-muted">{item.category}</small>
                        <div className="mt-1">
                          <span className="badge bg-info">{item.available ? "זמין" : "אזל"}</span>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleUpdateQuantity(item._id as string, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleUpdateQuantity(item._id as string, item.quantity + 1)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-3 text-end">
                        <div className="mb-2">
                          <strong className="text-success fs-5">
                            ₪{(item.price * item.quantity).toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <small className="text-muted">₪{item.price} × {item.quantity}</small>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm mt-2"
                          onClick={() => handleRemoveItem(item._id as string, item.name)}
                        >
                          <i className="fas fa-trash me-1"></i>
                          הסר
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-calculator me-2"></i>
                    סיכום הזמנה
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>כמות פריטים:</span>
                    <span className="fw-bold">{totalItems}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>סה"כ ביניים:</span>
                    <span>₪{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>משלוח:</span>
                    <span className="text-success">חינם</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold fs-5">סה"כ לתשלום:</span>
                    <span className="fw-bold fs-5 text-success">
                      ₪{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <button 
                    className="btn btn-success w-100 py-2"
                    onClick={handleCheckout}
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    המשך לתשלום
                  </button>
                  
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      תשלום מאובטח ומוצפן
                    </small>
                  </div>
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-body">
                  <h6>
                    <i className="fas fa-info-circle me-2 text-info"></i>
                    מידע נוסף
                  </h6>
                  <ul className="list-unstyled small mb-0">
                    <li className="mb-1">
                      <i className="fas fa-truck me-2 text-success"></i>
                      משלוח חינם לכל הארץ
                    </li>
                    <li className="mb-1">
                      <i className="fas fa-undo me-2 text-warning"></i>
                      החזרה עד 30 יום
                    </li>
                    <li className="mb-1">
                      <i className="fas fa-shield-alt me-2 text-info"></i>
                      אחריות יצרן מלאה
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Empty Cart
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart fa-5x text-muted opacity-50"></i>
          </div>
          <h4 className="text-muted mb-3">העגלה שלך ריקה</h4>
          <p className="text-muted mb-4">
            נראה שלא הוספת עדיין מוצרים לעגלת הקניות שלך
          </p>
          <a href="/products" className="btn btn-primary btn-lg">
            <i className="fas fa-shopping-bag me-2"></i>
            התחל לקנות
          </a>
        </div>
      )}
    </Layout>
  );
};

export default Cart;