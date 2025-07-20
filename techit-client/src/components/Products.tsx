import { FunctionComponent, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Product } from "../interfaces/Product";
import { getAllProducts } from "../services/productsService";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SearchBar from "./SearchBar";
import { getPayloadFromToken } from "../services/usersService";
import AddProductModal from "./AddProductModal";
import UpdateProductModal from "./UpdateProductModal";
import DeleteProductModal from "./DeleteProductModal";
import FavoriteButton from "./FavoriteButton";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/redux";
import { addToCartAsync, addToCartLocal, fetchCartItems } from "../store/cartSlice";

interface ProductsProps {}

type ViewMode = 'cards' | 'table';

const Products: FunctionComponent<ProductsProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [productsChanged, setProductsChanged] = useState<boolean>(false);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [productId, setProductId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Redux cart hook
  const { dispatch, loading: cartLoading } = useCart();

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  useEffect(() => {
    // Check if user is admin
    if (localStorage.getItem("token") != null) {
      try {
        let payload = getPayloadFromToken();
        setIsAdmin(payload.isAdmin);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts();
    // Load shopping cart
    dispatch(fetchCartItems());
  }, [productsChanged, dispatch]);

  useEffect(() => {
    // Filter products by search and category
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.available;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = () => {
    getAllProducts()
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        toast.error("שגיאה בטעינת המוצרים");
        setProducts([]);
        setFilteredProducts([]);
      });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddProduct = () => {
    setOpenAddModal(true);
  };

  const refresh = () => {
    setProductsChanged(!productsChanged);
  };

  // Updated function for adding to cart with Redux
  const handleAddToCart = async (product: Product) => {
    if (!product.available) {
      toast.error("המוצר אינו זמין כעת");
      return;
    }

    try {
      // Add to cart locally immediately for good UX
      dispatch(addToCartLocal(product));
      toast.success(`${product.name} נוסף לעגלה!`);

      // Send to server in background
      await dispatch(addToCartAsync(product._id as string)).unwrap();

      // Refresh cart from server
      dispatch(fetchCartItems());
    } catch (error: any) {
      toast.error(error || "שגיאה בהוספה לעגלה");
    }
  };

  const renderCards = () => (
    <div className="row">
      {filteredProducts.map((product: Product) => (
        <div key={product._id} className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100 shadow-sm product-card">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <small>{product.category}</small>
              <span
                className={`badge ${
                  product.available ? "bg-success" : "bg-danger"
                }`}
              >
                {product.available ? "זמין" : "אזל"}
              </span>
            </div>

            <Link
              to={`/products/${product._id}`}
              className="text-decoration-none"
            >
              <img
                src={product.image}
                className="card-img-top"
                alt={`תמונה של ${product.name}`}
                title={`לחץ לצפייה בפרטי ${product.name}`}
                style={{
                  height: "200px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/400x300?text=תמונה+לא+זמינה";
                }}
              />
            </Link>

            <div className="card-body d-flex flex-column">
              <h5 className="card-title">
                <Link
                  to={`/products/${product._id}`}
                  className="text-decoration-none text-dark"
                  title={`צפה בפרטי ${product.name}`}
                >
                  {product.name}
                </Link>
              </h5>

              <p className="card-text flex-grow-1 text-muted small">
                {product.description.length > 100
                  ? `${product.description.substring(0, 100)}...`
                  : product.description}
              </p>

              <p className="card-text price-tag mb-3">
                ₪{product.price.toLocaleString()}
              </p>

              <div className="d-flex gap-2 flex-wrap mt-auto">
                <Link
                  to={`/products/${product._id}`}
                  className="btn btn-outline-info btn-sm"
                  title={`צפה בפרטי ${product.name}`}
                >
                  <i className="fas fa-eye me-1"></i>
                  פרטים
                </Link>

                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.available || cartLoading}
                  title={product.available ? "הוסף לעגלה" : "אזל מהמלאי"}
                >
                  {cartLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      מוסיף...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-cart-plus me-2"></i>
                      {product.available ? "הוסף לעגלה" : "אזל מהמלאי"}
                    </>
                  )}
                </button>

                <FavoriteButton
                  productId={product._id as string}
                  className="btn"
                />

                {isAdmin && (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setOpenUpdateModal(true);
                        setProductId(product._id as string);
                      }}
                      title="ערוך מוצר"
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setProductId(product._id as string);
                      }}
                      title="מחק מוצר"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-modern">
        <thead className="table-dark">
          <tr>
            <th>תמונה</th>
            <th>שם מוצר</th>
            <th>קטגוריה</th>
            <th>מחיר</th>
            <th>תיאור</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product: Product) => (
            <tr key={product._id}>
              <td>
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.image}
                    alt={`תמונה של ${product.name}`}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    className="rounded"
                    title={`לחץ לצפייה בפרטי ${product.name}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/50x50?text=תמונה";
                    }}
                  />
                </Link>
              </td>
              <td className="fw-bold">
                <Link
                  to={`/products/${product._id}`}
                  className="text-decoration-none"
                  title={`צפה בפרטי ${product.name}`}
                >
                  {product.name}
                </Link>
              </td>
              <td>
                <span className="badge bg-info">{product.category}</span>
              </td>
              <td className="text-success fw-bold">
                ₪{product.price.toLocaleString()}
              </td>
              <td>
                <small title={product.description}>
                  {product.description.substring(0, 50)}...
                </small>
              </td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  <Link
                    to={`/products/${product._id}`}
                    className="btn btn-sm btn-outline-info"
                    title={`צפה בפרטי ${product.name}`}
                  >
                    <i className="fas fa-eye"></i>
                  </Link>

                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddToCart(product)}
                    title="הוסף לעגלה"
                    disabled={!product.available || cartLoading}
                  >
                    {cartLoading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="fa fa-cart-plus"></i>
                    )}
                  </button>

                  <FavoriteButton
                    productId={product._id as string}
                    className="btn btn-sm"
                  />

                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setOpenUpdateModal(true);
                          setProductId(product._id as string);
                        }}
                        title="ערוך"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setProductId(product._id as string);
                        }}
                        title="מחק"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5">המוצרים שלנו</h1>
          {isAdmin && (
            <button className="btn btn-success" onClick={handleAddProduct}>
              <i className="fa fa-plus me-2"></i>
              הוסף מוצר
            </button>
          )}
        </div>

        <div className="row mb-4">
          <div className="col-lg-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="חפש מוצרים לפי שם או תיאור..."
            />
          </div>
          <div className="col-lg-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="all">כל הקטגוריות</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${
                  viewMode === "cards" ? "btn-info" : "btn-outline-info"
                }`}
                onClick={() => setViewMode("cards")}
                title="תצוגת כרטיסים"
              >
                <i className="fa fa-th-large"></i>
              </button>
              <button
                type="button"
                className={`btn ${
                  viewMode === "table" ? "btn-info" : "btn-outline-info"
                }`}
                onClick={() => setViewMode("table")}
                title="תצוגת טבלה"
              >
                <i className="fa fa-table"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <small className="text-muted">
            נמצאו {filteredProducts.length} מוצרים
            {searchTerm && ` עבור "${searchTerm}"`}
            {selectedCategory !== "all" && ` בקטגוריה "${selectedCategory}"`}
          </small>
        </div>

        {filteredProducts.length ? (
          viewMode === "cards" ? (
            renderCards()
          ) : (
            renderTable()
          )
        ) : (
          <div className="text-center py-5">
            <i className="fa fa-search fa-3x text-muted mb-3"></i>
            <h4 className="text-muted">לא נמצאו מוצרים</h4>
            <p className="text-muted">נסה לשנות את תנאי החיפוש</p>
          </div>
        )}
      </div>

      <AddProductModal
        show={openAddModal}
        onHide={() => setOpenAddModal(false)}
        refresh={refresh}
      />
      <UpdateProductModal
        show={openUpdateModal}
        onHide={() => setOpenUpdateModal(false)}
        refresh={refresh}
        productId={productId}
      />
      <DeleteProductModal
        show={openDeleteModal}
        onHide={() => setOpenDeleteModal(false)}
        refresh={refresh}
        productId={productId}
      />

      <Footer />
    </>
  );
};

export default Products;