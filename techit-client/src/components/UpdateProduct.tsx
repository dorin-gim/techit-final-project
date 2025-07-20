import { FormikValues, useFormik } from "formik";
import { FunctionComponent, useEffect, useState } from "react";
import * as yup from "yup";
import { Product } from "../interfaces/Product";
import { getProductById, updateProduct } from "../services/productsService";

interface UpdateProductProps {
  onHide: Function;
  refresh: Function;
  productId: string;
}

const UpdateProduct: FunctionComponent<UpdateProductProps> = ({
  productId,
  onHide,
  refresh,
}) => {
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    category: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductById(productId)
      .then((res) => {
        setProduct(res.data);
      })
      .catch(() => {
        alert("שגיאה בטעינת פרטי המוצר");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  const formik: FormikValues = useFormik({
    initialValues: product,
    enableReinitialize: true,
    validationSchema: yup.object({
      name: yup.string().required("שם המוצר נדרש").min(2, "שם חייב להכיל לפחות 2 תווים"),
      price: yup.number().required("מחיר נדרש").moreThan(0, "מחיר חייב להיות גדול מ-0"),
      category: yup.string().required("קטגוריה נדרשת").min(2, "קטגוריה חייבת להכיל לפחות 2 תווים"),
      description: yup.string().required("תיאור נדרש").min(2, "תיאור חייב להכיל לפחות 2 תווים"),
      image: yup.string().required("תמונה נדרשת").url("כתובת URL לא תקינה"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await updateProduct({ ...values, _id: productId });
        alert("המוצר עודכן בהצלחה!");
        onHide();
        refresh();
      } catch (error: any) {
        const errorMessage = error.response?.data || "שגיאה בעדכון המוצר";
        alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">טוען...</span>
        </div>
        <p className="mt-2 text-muted">טוען פרטי מוצר...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container w-75">
        <form onSubmit={formik.handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${
                formik.touched.name && formik.errors.name
                  ? "is-invalid"
                  : formik.touched.name
                  ? "is-valid"
                  : ""
              }`}
              id="name"
              placeholder="שם המוצר"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <label htmlFor="name">שם המוצר</label>
            {formik.touched.name && formik.errors.name && (
              <div className="invalid-feedback">{formik.errors.name}</div>
            )}
          </div>

          <div className="form-floating mb-3">
            <input
              type="number"
              className={`form-control ${
                formik.touched.price && formik.errors.price
                  ? "is-invalid"
                  : formik.touched.price
                  ? "is-valid"
                  : ""
              }`}
              id="price"
              placeholder="מחיר"
              name="price"
              value={formik.values.price}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <label htmlFor="price">מחיר (₪)</label>
            {formik.touched.price && formik.errors.price && (
              <div className="invalid-feedback">{formik.errors.price}</div>
            )}
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control ${
                formik.touched.category && formik.errors.category
                  ? "is-invalid"
                  : formik.touched.category
                  ? "is-valid"
                  : ""
              }`}
              id="category"
              placeholder="קטגוריה"
              name="category"
              value={formik.values.category}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <label htmlFor="category">קטגוריה</label>
            {formik.touched.category && formik.errors.category && (
              <div className="invalid-feedback">{formik.errors.category}</div>
            )}
          </div>

          <div className="form-floating mb-3">
            <textarea
              className={`form-control ${
                formik.touched.description && formik.errors.description
                  ? "is-invalid"
                  : formik.touched.description
                  ? "is-valid"
                  : ""
              }`}
              id="description"
              placeholder="תיאור"
              name="description"
              value={formik.values.description}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              style={{ height: "100px" }}
            />
            <label htmlFor="description">תיאור המוצר</label>
            {formik.touched.description && formik.errors.description && (
              <div className="invalid-feedback">{formik.errors.description}</div>
            )}
          </div>

          <div className="form-floating mb-3">
            <input
              type="url"
              className={`form-control ${
                formik.touched.image && formik.errors.image
                  ? "is-invalid"
                  : formik.touched.image
                  ? "is-valid"
                  : ""
              }`}
              id="image"
              placeholder="כתובת תמונה"
              name="image"
              value={formik.values.image}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <label htmlFor="image">כתובת תמונה (URL)</label>
            {formik.touched.image && formik.errors.image && (
              <div className="invalid-feedback">{formik.errors.image}</div>
            )}
          </div>

          <button
            className="btn btn-warning mt-3 w-100"
            type="submit"
            disabled={!formik.dirty || !formik.isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                מעדכן מוצר...
              </>
            ) : (
              <>
                <i className="fas fa-edit me-2"></i>
                עדכן מוצר
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateProduct;