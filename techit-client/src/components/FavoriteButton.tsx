import { FunctionComponent, useState, useEffect } from "react";
import { addToFavorites, removeFromFavorites, checkIfFavorite } from "../services/favoritesService";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton: FunctionComponent<FavoriteButtonProps> = ({ 
  productId, 
  className = "btn btn-outline-danger",
  onToggle
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavoriteStatus();
  }, [productId]);

  const loadFavoriteStatus = async () => {
    try {
      const favoriteStatus = await checkIfFavorite(productId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      // If error (like user not logged in), just assume not favorite
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!localStorage.getItem("token")) {
      alert("יש להתחבר כדי להוסיף למועדפים");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(productId);
        setIsFavorite(false);
        alert("המוצר הוסר מהמועדפים");
      } else {
        await addToFavorites(productId);
        setIsFavorite(true);
        alert("המוצר נוסף למועדפים");
      }
      
      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data || "שגיאה בעדכון מועדפים";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${className} ${isFavorite ? "btn-danger" : "btn-outline-danger"}`}
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm"></span>
      ) : (
        <i className={`fas fa-heart ${isFavorite ? "" : "text-muted"}`}></i>
      )}
    </button>
  );
};

export default FavoriteButton;