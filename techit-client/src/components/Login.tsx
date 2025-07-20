import { FormikValues, useFormik } from "formik";
import { FunctionComponent, useState } from "react";
import { checkUser } from "../services/usersService";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { loginSchema } from "../utils/validationSchemas";

interface LoginProps {}

const Login: FunctionComponent<LoginProps> = () => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setSubmitError("");
      
      try {
        const res = await checkUser(values);
        localStorage.setItem("token", JSON.stringify(res.data));

        // Display success message
        const successAlert = document.createElement("div");
        successAlert.className = "alert alert-success-modern position-fixed";
        successAlert.style.cssText =
          "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
        successAlert.innerHTML = `
          <i class="fas fa-check-circle alert-icon"></i>
          <div class="alert-content">
            <div class="alert-title">התחברות בוצעה בהצלחה!</div>
            <div class="alert-message">מעביר לעמוד הבית...</div>
          </div>
        `;
        document.body.appendChild(successAlert);

        setTimeout(() => {
          document.body.removeChild(successAlert);
          navigate("/home");
        }, 1500);
      } catch (err: any) {
        let errorMessage = "אירעה שגיאה בהתחברות";

        if (err.response?.status === 400) {
          errorMessage = "אימייל או סיסמה שגויים";
        } else if (err.response?.status === 404) {
          errorMessage = "משתמש לא נמצא במערכת";
        } else if (err.response?.status === 500) {
          errorMessage = "שגיאת שרת - נסה שוב מאוחר יותר";
        } else if (err.response?.data) {
          errorMessage = err.response.data;
        }

        setSubmitError(errorMessage);
      }
    },
  });

  const getFieldClass = (fieldName: keyof typeof formik.values) => {
    const baseClass = "form-control";
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return `${baseClass} is-invalid`;
    } else if (formik.touched[fieldName] && !formik.errors[fieldName]) {
      return `${baseClass} is-valid`;
    }
    return baseClass;
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="card-title text-gradient-info mb-3">
                    <i className="fas fa-laptop me-2"></i>
                    TechIt
                  </h2>
                  <p className="text-muted">התחבר לחשבון שלך</p>
                </div>

                {submitError && (
                  <div className="alert alert-danger-modern mb-4 fade-in">
                    <i className="fas fa-exclamation-triangle alert-icon"></i>
                    <div className="alert-content">
                      <div className="alert-title">שגיאה בהתחברות</div>
                      <div className="alert-message">{submitError}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={formik.handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2 text-info"></i>
                      כתובת אימייל
                    </label>
                    <div className="position-relative">
                      <input
                        type="email"
                        className={getFieldClass("email")}
                        id="email"
                        name="email"
                        placeholder="הכנס את האימייל שלך"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="email"
                        dir="ltr"
                        style={{ textAlign: "left", paddingLeft: "2.5rem" }}
                      />
                      <i className="fas fa-at position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                    </div>
                    
                    {formik.touched.email && formik.errors.email && (
                      <div className="error-message fade-in">
                        <i className="fas fa-exclamation-circle"></i>
                        {formik.errors.email}
                      </div>
                    )}
                    
                    {formik.touched.email && !formik.errors.email && formik.values.email && (
                      <div className="success-message fade-in">
                        <i className="fas fa-check-circle"></i>
                        כתובת אימייל תקינה
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="fas fa-lock me-2 text-info"></i>
                      סיסמה
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={getFieldClass("password")}
                        id="password"
                        name="password"
                        placeholder="הכנס את הסיסמה שלך"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="current-password"
                        dir="ltr"
                        style={{ textAlign: "left", paddingLeft: "4rem" }}
                      />
                      <i className="fas fa-key position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                      </button>
                    </div>
                    
                    {formik.touched.password && formik.errors.password && (
                      <div className="error-message fade-in">
                        <i className="fas fa-exclamation-circle"></i>
                        {formik.errors.password}
                      </div>
                    )}
                    
                    {formik.touched.password && !formik.errors.password && formik.values.password && (
                      <div className="success-message fade-in">
                        <i className="fas fa-check-circle"></i>
                        סיסמה תקינה
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-gradient-info w-100 mb-3 py-2"
                    type="submit"
                    disabled={!formik.isValid || loading || !formik.dirty}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        מתחבר...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        התחבר
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="mb-0 text-muted small">
                      עדיין אין לך חשבון?{" "}
                      <Link 
                        to="/register" 
                        className="text-info text-decoration-none fw-semibold"
                      >
                        הירשם עכשיו
                      </Link>
                    </p>
                  </div>
                </form>

                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <small className="text-muted">
                      <strong>מצב פיתוח:</strong><br/>
                      Valid: {formik.isValid ? '✅' : '❌'}<br/>
                      Dirty: {formik.dirty ? '✅' : '❌'}<br/>
                      Touched: {Object.keys(formik.touched).join(', ') || 'None'}<br/>
                      Errors: {Object.keys(formik.errors).join(', ') || 'None'}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
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
        
        .is-invalid {
          border-color: #dc3545;
          animation: shake 0.5s ease-in-out;
        }
        
        .is-valid {
          border-color: #28a745;
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
        }
        
        .position-relative input:focus + i {
          color: #17a2b8 !important;
        }
      `}</style>
    </div>
  );
};

export default Login;