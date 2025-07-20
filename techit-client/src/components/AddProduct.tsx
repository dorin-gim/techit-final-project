import { FormikValues, useFormik } from "formik";
import { FunctionComponent, useState } from "react";
import { Product } from "../interfaces/Product";
import { productSchema } from "../utils/validationSchemas";
import { addProduct } from "../services/productsService";

interface AddProductProps {
  onHide: Function;
  refresh: Function;
}

const AddProduct: FunctionComponent<AddProductProps> = ({
  onHide,
  refresh,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");

  const formik: FormikValues = useFormik({
    initialValues: {
      name: "",
      price: "",
      category: "",
      description: "",
      image: "",
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setSubmitError("");
      
      try {
        await addProduct({
          ...values,
          price: Number(values.price),
          available: true,
        });

        onHide();
        refresh();

        //  Display success message
        const successAlert = document.createElement("div");
        successAlert.className =
          "alert alert-success-modern position-fixed fade-in";
        successAlert.style.cssText =
          "top: 20px; right: 20px; z-index: 9999; min-width: 350px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);";
        successAlert.innerHTML = `
          <i class="fas fa-check-circle alert-icon text-success" style="font-size: 1.5rem;"></i>
          <div class="alert-content">
            <div class="alert-title fw-bold">הצלחה!</div>
            <div class="alert-message">המוצר "${values.name}" נוסף בהצלחה למערכת</div>
          </div>
        `;
        document.body.appendChild(successAlert);

        setTimeout(() => {
          if (document.body.contains(successAlert)) {
            successAlert.style.animation = "fadeOut 0.3s ease-out forwards";
            setTimeout(() => {
              if (document.body.contains(successAlert)) {
                document.body.removeChild(successAlert);
              }
            }, 300);
          }
        }, 3000);
      } catch (error: any) {
        let errorMessage = "שגיאה בהוספת המוצר";
        
        if (error.response?.status === 400) {
          errorMessage = "מוצר עם שם זה כבר קיים במערכת";
        } else if (error.response?.status === 401) {
          errorMessage = "אין לך הרשאה להוסיף מוצרים";
        } else if (error.response?.status === 422) {
          errorMessage = "הנתונים שהוזנו אינם תקינים";
        } else if (error.response?.status === 500) {
          errorMessage = "שגיאת שרת - נסה שוב מאוחר יותר";
        } else if (error.response?.data) {
          errorMessage = error.response.data;
        }
        
        setSubmitError(errorMessage);
        
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const getFieldClass = (fieldName: string) => {
    const baseClass = "form-control";
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return `${baseClass} is-invalid border-danger`;
    } else if (formik.touched[fieldName] && !formik.errors[fieldName] && formik.values[fieldName]) {
      return `${baseClass} is-valid border-success`;
    }
    return baseClass;
  };

  const handleImageChange = (value: string) => {
    formik.setFieldValue("image", value);

    // Checking if this is a valid URL for an image
    if (value && value.startsWith("http")) {
      const img = new Image();
      img.onload = () => setImagePreview(value);
      img.onerror = () => setImagePreview("");
      img.src = value;
    } else {
      setImagePreview("");
    }
  };

  const formatPrice = (value: string) => {
    // Remove irrelevant characters
    const numericValue = value.replace(/[^\d.]/g, "");

    // Preventing more than one point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    // Limit digits after the point
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2);
    }

    return numericValue;
  };

  const isFormValid = () => {
    return formik.isValid && 
           formik.dirty && 
           Object.keys(formik.errors).length === 0 &&
           formik.values.name.trim() &&
           formik.values.price &&
           formik.values.category.trim() &&
           formik.values.description.trim() &&
           formik.values.image.trim();
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        <div className="col-12">
          {submitError && (
            <div className="alert alert-danger-modern mb-4 fade-in">
              <i className="fas fa-exclamation-triangle alert-icon"></i>
              <div className="alert-content">
                <div className="alert-title fw-bold">שגיאה בהוספת מוצר</div>
                <div className="alert-message">{submitError}</div>
              </div>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate autoComplete="off">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="mb-4">
                  <label htmlFor="name" className="form-label fw-semibold mb-2">
                    <i className="fas fa-tag me-2 text-info"></i>
                    שם המוצר
                    <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className={getFieldClass("name")}
                      id="name"
                      name="name"
                      placeholder="הכנס שם מוצר מפורט ומתאר"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={100}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <i className="fas fa-box position-absolute end-0 top-50 translate-middle-y me-3 text-muted"></i>
                  </div>

                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      {formik.touched.name && formik.errors.name && (
                        <div className="error-message fade-in">
                          <i className="fas fa-exclamation-circle"></i>
                          {formik.errors.name}
                        </div>
                      )}

                      {formik.touched.name &&
                        !formik.errors.name &&
                        formik.values.name && (
                          <div className="success-message fade-in">
                            <i className="fas fa-check-circle"></i>
                            שם מוצר תקין
                          </div>
                        )}
                    </div>
                    <small className="text-muted">
                      {formik.values.name.length}/100
                    </small>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="price"
                    className="form-label fw-semibold mb-2"
                  >
                    <i className="fas fa-shekel-sign me-2 text-info"></i>
                    מחיר
                    <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className={getFieldClass("price")}
                      id="price"
                      name="price"
                      placeholder="0.00"
                      value={formik.values.price}
                      onChange={(e) => {
                        const formatted = formatPrice(e.target.value);
                        formik.setFieldValue("price", formatted);
                      }}
                      onBlur={formik.handleBlur}
                      dir="ltr"
                      style={{ textAlign: "left", paddingLeft: "2.5rem" }}
                    />
                    <i className="fas fa-coins position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                  </div>

                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      {formik.touched.price && formik.errors.price && (
                        <div className="error-message fade-in">
                          <i className="fas fa-exclamation-circle"></i>
                          {formik.errors.price}
                        </div>
                      )}

                      {formik.touched.price &&
                        !formik.errors.price &&
                        formik.values.price && (
                          <div className="success-message fade-in">
                            <i className="fas fa-check-circle"></i>
                            מחיר תקין
                          </div>
                        )}
                    </div>
                    <small className="text-muted">₪ ש״ח</small>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="category"
                    className="form-label fw-semibold mb-2"
                  >
                    <i className="fas fa-list me-2 text-info"></i>
                    קטגוריה
                    <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className={getFieldClass("category")}
                      id="category"
                      name="category"
                      placeholder="לדוגמה: לפטופים, אוזניות, טלפונים"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={50}
                      style={{ paddingRight: "2.5rem" }}
                      list="category-suggestions"
                    />
                    <i className="fas fa-folder position-absolute end-0 top-50 translate-middle-y me-3 text-muted"></i>

                    <datalist id="category-suggestions">
                      <option value="לפטופים">לפטופים</option>
                      <option value="אוזניות וסלולר">אוזניות וסלולר</option>
                      <option value="טלפונים חכמים">טלפונים חכמים</option>
                      <option value="מחשבים נייחים">מחשבים נייחים</option>
                      <option value="אביזרי מחשב">אביזרי מחשב</option>
                      <option value="מסכי מחשב">מסכי מחשב</option>
                      <option value="אביזרי משחק">אביזרי משחק</option>
                      <option value="טאבלטים">טאבלטים</option>
                    </datalist>
                  </div>

                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      {formik.touched.category && formik.errors.category && (
                        <div className="error-message fade-in">
                          <i className="fas fa-exclamation-circle"></i>
                          {formik.errors.category}
                        </div>
                      )}

                      {formik.touched.category &&
                        !formik.errors.category &&
                        formik.values.category && (
                          <div className="success-message fade-in">
                            <i className="fas fa-check-circle"></i>
                            קטגוריה תקינה
                          </div>
                        )}
                    </div>
                    <small className="text-muted">
                      {formik.values.category.length}/50
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold mb-2"
                  >
                    <i className="fas fa-align-right me-2 text-info"></i>
                    תיאור המוצר
                    <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={getFieldClass("description")}
                    id="description"
                    name="description"
                    placeholder="תאר את המוצר בפירוט - תכונות, יתרונות, שימושים..."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={5}
                    maxLength={500}
                    style={{ resize: "vertical", minHeight: "120px" }}
                  />

                  <div className="d-flex justify-content-between mt-1">
                    <div>
                      {formik.touched.description &&
                        formik.errors.description && (
                          <div className="error-message fade-in">
                            <i className="fas fa-exclamation-circle"></i>
                            {formik.errors.description}
                          </div>
                        )}

                      {formik.touched.description &&
                        !formik.errors.description &&
                        formik.values.description && (
                          <div className="success-message fade-in">
                            <i className="fas fa-check-circle"></i>
                            תיאור מפורט וטוב
                          </div>
                        )}
                    </div>
                    <small
                      className={`${
                        formik.values.description.length > 450
                          ? "text-warning"
                          : "text-muted"
                      }`}
                    >
                      {formik.values.description.length}/500
                    </small>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="image"
                    className="form-label fw-semibold mb-2"
                  >
                    <i className="fas fa-image me-2 text-info"></i>
                    כתובת תמונה
                    <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="url"
                      className={getFieldClass("image")}
                      id="image"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formik.values.image}
                      onChange={(e) => {
                        formik.handleChange(e);
                        handleImageChange(e.target.value);
                      }}
                      onBlur={formik.handleBlur}
                      dir="ltr"
                      style={{ textAlign: "left", paddingLeft: "2.5rem" }}
                    />
                    <i className="fas fa-link position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                  </div>

                  {formik.touched.image && formik.errors.image && (
                    <div className="error-message fade-in">
                      <i className="fas fa-exclamation-circle"></i>
                      {formik.errors.image}
                    </div>
                  )}

                  {formik.touched.image &&
                    !formik.errors.image &&
                    formik.values.image && (
                      <div className="success-message fade-in">
                        <i className="fas fa-check-circle"></i>
                        כתובת תמונה תקינה
                      </div>
                    )}

                  {imagePreview && (
                    <div className="mt-3 text-center">
                      <small className="text-muted d-block mb-2">
                        תצוגה מקדימה:
                      </small>
                      <div className="border rounded p-2 bg-light">
                        <img
                          src={imagePreview}
                          alt="תצוגה מקדימה"
                          className="img-thumbnail"
                          style={{
                            maxWidth: "150px",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                          onError={() => setImagePreview("")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {formik.dirty && !isFormValid() && (
              <div className="alert alert-info-modern mb-4">
                <i className="fas fa-info-circle alert-icon"></i>
                <div className="alert-content">
                  <div className="alert-message">
                    אנא מלא את כל השדות הנדרשים ותקן שגיאות לפני השמירה
                  </div>
                </div>
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                className="btn btn-gradient-success py-2 fw-semibold"
                type="submit"
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner me-2"></span>
                    מוסיף מוצר למערכת...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    הוסף מוצר למערכת
                  </>
                )}
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-light rounded border">
                <small className="text-muted">
                  <strong>🔧 מצב פיתוח:</strong>
                  <br />✅ Valid: {formik.isValid ? "כן" : "לא"}
                  <br />
                  ✏️ Dirty: {formik.dirty ? "כן" : "לא"}
                  <br />
                  👆 Touched:{" "}
                  {Object.keys(formik.touched).join(", ") || "אף שדה"}
                  <br />❌ Errors:{" "}
                  {Object.keys(formik.errors).join(", ") || "אין שגיאות"}
                  <br />
                  🎯 Form Valid: {isFormValid() ? "כן" : "לא"}
                  <br />
                  🖼️ Image Preview: {imagePreview ? "יש" : "אין"}
                </small>
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .fade-in {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        .is-invalid {
          border-color: #dc3545 !important;
          animation: shake 0.5s ease-in-out;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        
        .is-valid {
          border-color: #28a745 !important;
          box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
        }
        
        @keyframes shake {
          0%, 20%, 40%, 60%, 80%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .position-relative input:focus + i,
        .position-relative textarea:focus + i {
          color: #17a2b8 !important;
          transition: color 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #17a2b8;
          box-shadow: 0 0 0 0.2rem rgba(23, 162, 184, 0.25);
        }
        
        .img-thumbnail {
          transition: transform 0.3s ease;
        }
        
        .img-thumbnail:hover {
          transform: scale(1.05);
        }
        
        datalist {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AddProduct;