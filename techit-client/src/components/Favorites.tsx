import { FunctionComponent, useEffect, useState } from "react";
import Layout from "./Layout";
import { getFavorites } from "../services/favoritesService";
import { addToCart } from "../services/cartsService";
import FavoriteButton from "./FavoriteButton";
import { Product } from "../interfaces/Product";

interface FavoritesProps {}

const Favorites: FunctionComponent<FavoritesProps> = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error: any) {
      console.error("Error loading favorites:", error);
      alert("שגיאה בטעינת המועדפים");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (productId: string) => {
    setFavorites(favorites.filter(fav => fav._id !== productId));
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart(productId);
      alert(`${productName} נוסף לעגלה בהצלחה!`);
    } catch (error: any) {
      alert("שגיאה בהוספה לעגלה");
    }
  };

  if (loading) {
    return (
      <Layout title="המועדפים שלי">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-2 text-muted">טוען מועדפים...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="המועדפים שלי">
      {favorites.length > 0 ? (
        <>
          <div className="alert alert-info">
            <i className="fas fa-heart me-2"></i>
            יש לך {favorites.length} מוצרים במועדפים
          </div>
          
          <div className="row">
            {favorites.map((product: Product) => (
              <div key={product._id} className="col-lg-4 col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                    <small>{product.category}</small>
                    <span className={`badge ${product.available ? "bg-success" : "bg-danger"}`}>
                      {product.available ? "זמין" : "אזל"}
                    </span>
                  </div>
                  <img
                    src={product.image}
                    className="card-img-top"
                    alt={`תמונה של ${product.name}`}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                      {product.description}
                    </p>
                    <p className="card-text text-success fw-bold fs-5">
                      ₪{product.price}
                    </p>
                    
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary flex-grow-1"
                        onClick={() => handleAddToCart(product._id as string, product.name)}
                        disabled={!product.available}
                      >
                        <i className="fas fa-cart-plus me-1"></i>
                        {product.available ? "הוסף לעגלה" : "אזל מהמלאי"}
                      </button>
                      
                      <FavoriteButton 
                        productId={product._id as string}
                        className="btn"
                        onToggle={(isFavorite) => {
                          if (!isFavorite) {
                            handleRemoveFavorite(product._id as string);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-heart-broken fa-5x text-muted mb-4"></i>
          <h4 className="text-muted">אין מוצרים במועדפים</h4>
          <p className="text-muted">הוסף מוצרים למועדפים כדי לראות אותם כאן</p>
          <a href="/products" className="btn btn-info">
            <i className="fas fa-shopping-bag me-2"></i>
            חזור לקניות
          </a>
        </div>
      )}
    </Layout>
  );
};

export default Favorites;