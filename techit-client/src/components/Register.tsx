import { useFormik } from "formik";
import { FunctionComponent, useState, useEffect } from "react";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { registerSchema, getPasswordStrength } from "../utils/validationSchemas";
import { addUser } from "../services/usersService";

interface RegisterProps {}

const Register: FunctionComponent<RegisterProps> = () => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    strength: "",
    color: "",
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: false,
      noSpaces: false,
    },
    percentage: 0,
  });

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setSubmitError("");

      try {
        const res = await addUser({ ...values, isAdmin: false });
        localStorage.setItem("token", JSON.stringify(res.data));

        const successAlert = document.createElement("div");
        successAlert.className =
          "alert alert-success-modern position-fixed fade-in";
        successAlert.style.cssText =
          "top: 20px; right: 20px; z-index: 9999; min-width: 350px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);";
        successAlert.innerHTML = `
          <i class="fas fa-check-circle alert-icon text-success" style="font-size: 1.5rem;"></i>
          <div class="alert-content">
            <div class="alert-title fw-bold">הרשמה בוצעה בהצלחה!</div>
            <div class="alert-message">ברוך הבא ל-TechIt, ${values.name}</div>
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
          navigate("/home");
        }, 2000);
      } catch (err: any) {
        let errorMessage = "אירעה שגיאה בהרשמה";

        if (err.response?.status === 400) {
          errorMessage = "משתמש עם אימייל זה כבר קיים במערכת";
        } else if (err.response?.status === 422) {
          errorMessage = "הנתונים שהוזנו אינם תקינים";
        } else if (err.response?.status === 500) {
          errorMessage = "שגיאת שרת - נסה שוב מאוחר יותר";
        } else if (err.response?.data) {
          errorMessage = err.response.data;
        }

        setSubmitError(errorMessage);

        // Scroll to top of form to show error
        const form = document.querySelector("form");
        if (form) {
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Password strength check
  useEffect(() => {
    const password = formik.values.password;
    if (password) {
      const strength = getPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        score: 0,
        strength: "",
        color: "",
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          numbers: false,
          special: false,
          noSpaces: false,
        },
        percentage: 0,
      });
    }
  }, [formik.values.password]);

  const getFieldClass = (fieldName: keyof typeof formik.values) => {
    const baseClass = "form-control";
    if (formik.touched[fieldName] && formik.errors[fieldName]) {
      return `${baseClass} is-invalid border-danger`;
    } else if (
      formik.touched[fieldName] &&
      !formik.errors[fieldName] &&
      formik.values[fieldName]
    ) {
      return `${baseClass} is-valid border-success`;
    }
    return baseClass;
  };

  const isFormValid = () => {
    return (
      formik.isValid &&
      formik.dirty &&
      passwordStrength.score >= 5 &&
      Object.keys(formik.errors).length === 0
    );
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i
                      className="fas fa-laptop text-gradient-info"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h2 className="card-title text-gradient-info mb-2 fw-bold">
                    TechIt
                  </h2>
                  <p className="text-muted mb-0">
                    צור חשבון חדש וצטרף לקהילה שלנו
                  </p>
                  <small className="text-muted">כל השדות הם חובה</small>
                </div>

                {submitError && (
                  <div className="alert alert-danger-modern mb-4 fade-in">
                    <i className="fas fa-exclamation-triangle alert-icon"></i>
                    <div className="alert-content">
                      <div className="alert-title fw-bold">שגיאה בהרשמה</div>
                      <div className="alert-message">{submitError}</div>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={formik.handleSubmit}
                  noValidate
                  autoComplete="off"
                >
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="form-label fw-semibold mb-2"
                    >
                      <i className="fas fa-user me-2 text-info"></i>
                      שם מלא
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className={getFieldClass("name")}
                        id="name"
                        name="name"
                        placeholder="הכנס את השם המלא שלך"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="name"
                        maxLength={50}
                        style={{ paddingRight: "2.5rem" }}
                      />
                      <i className="fas fa-id-card position-absolute end-0 top-50 translate-middle-y me-3 text-muted"></i>
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
                              שם תקין
                            </div>
                          )}
                      </div>
                      <small className="text-muted">
                        {formik.values.name.length}/50
                      </small>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="form-label fw-semibold mb-2"
                    >
                      <i className="fas fa-envelope me-2 text-info"></i>
                      כתובת אימייל
                    </label>
                    <div className="position-relative">
                      <input
                        type="email"
                        className={getFieldClass("email")}
                        id="email"
                        name="email"
                        placeholder="your.email@example.com"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="email"
                        dir="ltr"
                        maxLength={100}
                        style={{ textAlign: "left", paddingLeft: "2.5rem" }}
                      />
                      <i className="fas fa-at position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                    </div>

                    <div className="d-flex justify-content-between mt-1">
                      <div>
                        {formik.touched.email && formik.errors.email && (
                          <div className="error-message fade-in">
                            <i className="fas fa-exclamation-circle"></i>
                            {formik.errors.email}
                          </div>
                        )}

                        {formik.touched.email &&
                          !formik.errors.email &&
                          formik.values.email && (
                            <div className="success-message fade-in">
                              <i className="fas fa-check-circle"></i>
                              כתובת אימייל תקינה
                            </div>
                          )}
                      </div>
                      <small className="text-muted">
                        {formik.values.email.length}/100
                      </small>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold mb-2"
                    >
                      <i className="fas fa-lock me-2 text-info"></i>
                      סיסמה
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={getFieldClass("password")}
                        id="password"
                        name="password"
                        placeholder="הכנס סיסמה חזקה"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="new-password"
                        dir="ltr"
                        maxLength={128}
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
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          } text-muted`}
                        ></i>
                      </button>
                    </div>

                    {formik.values.password && (
                      <div className="password-strength mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted fw-semibold">
                            חוזק הסיסמה:
                          </small>
                          <small
                            className={`text-${passwordStrength.color} fw-bold`}
                          >
                            {passwordStrength.strength}
                          </small>
                        </div>
                        <div
                          className="progress mb-3"
                          style={{ height: "6px" }}
                        >
                          <div
                            className={`progress-bar bg-${passwordStrength.color}`}
                            style={{
                              width: `${passwordStrength.percentage}%`,
                              transition: "width 0.4s ease-in-out",
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {formik.values.password && (
                      <div className="password-requirements mt-3 p-3 bg-light rounded">
                        <small className="text-muted fw-semibold mb-2 d-block">
                          דרישות סיסמה:
                        </small>
                        <div className="row g-2">
                          <div className="col-6">
                            <div
                              className={`password-requirement ${
                                passwordStrength.requirements.length
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  passwordStrength.requirements.length
                                    ? "fa-check-circle"
                                    : "fa-circle"
                                } me-2`}
                              ></i>
                              <small>לפחות 8 תווים</small>
                            </div>
                            <div
                              className={`password-requirement ${
                                passwordStrength.requirements.uppercase
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  passwordStrength.requirements.uppercase
                                    ? "fa-check-circle"
                                    : "fa-circle"
                                } me-2`}
                              ></i>
                              <small>אות גדולה (A-Z)</small>
                            </div>
                            <div
                              className={`password-requirement ${
                                passwordStrength.requirements.lowercase
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  passwordStrength.requirements.lowercase
                                    ? "fa-check-circle"
                                    : "fa-circle"
                                } me-2`}
                              ></i>
                              <small>אות קטנה (a-z)</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div
                              className={`password-requirement ${
                                passwordStrength.requirements.numbers
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  passwordStrength.requirements.numbers
                                    ? "fa-check-circle"
                                    : "fa-circle"
                                } me-2`}
                              ></i>
                              <small>4 מספרים לפחות</small>
                            </div>
                            <div
                              className={`password-requirement ${
                                passwordStrength.requirements.special
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  passwordStrength.requirements.special
                                    ? "fa-check-circle"
                                    : "fa-circle"
                                } me-2`}
                              ></i>
                              <small>סימן מיוחד (!@#$...)</small>
                            </div>
                            <div
                              className={`password-requirement ${
                                passwordStrength.requirements.noSpaces
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              <i
                                className={`fas ${
                                  passwordStrength.requirements.noSpaces
                                    ? "fa-check-circle"
                                    : "fa-circle"
                                } me-2`}
                              ></i>
                              <small>ללא רווחים</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between mt-2">
                      <div>
                        {formik.touched.password && formik.errors.password && (
                          <div className="error-message fade-in">
                            <i className="fas fa-exclamation-circle"></i>
                            {formik.errors.password}
                          </div>
                        )}
                      </div>
                      <small className="text-muted">
                        {formik.values.password.length}/128
                      </small>
                    </div>
                  </div>

                  {passwordStrength.score < 5 &&
                    formik.values.password &&
                    passwordStrength.score > 0 && (
                      <div className="alert alert-warning-modern mb-4">
                        <i className="fas fa-shield-alt alert-icon"></i>
                        <div className="alert-content">
                          <div className="alert-title">
                            סיסמה חזקה יותר נדרשת
                          </div>
                          <div className="alert-message">
                            אנא השלם את כל הדרישות לצורך הרשמה בטוחה
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="d-grid gap-2 mb-4">
                    <button
                      className="btn btn-gradient-info py-2 fw-semibold"
                      type="submit"
                      disabled={!isFormValid() || loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading-spinner me-2"></span>
                          מבצע הרשמה...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          הירשם ל-TechIt
                        </>
                      )}
                    </button>
                  </div>

                  {!isFormValid() && formik.dirty && (
                    <div className="alert alert-info-modern mb-4">
                      <i className="fas fa-info-circle alert-icon"></i>
                      <div className="alert-content">
                        <div className="alert-message">
                          {!formik.isValid
                            ? "אנא תקן את השגיאות בטופס"
                            : passwordStrength.score < 5
                            ? "אנא חזק את הסיסמה"
                            : "מלא את כל השדות"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center border-top pt-4">
                    <p className="mb-0 text-muted">
                      כבר יש לך חשבון?{" "}
                      <Link
                        to="/"
                        className="text-info text-decoration-none fw-semibold"
                      >
                        התחבר כאן
                      </Link>
                    </p>
                  </div>
                </form>

                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4 p-3 bg-light rounded border">
                    <small className="text-muted">
                      <strong>🔧 מצב פיתוח:</strong>
                      <br />✅ Valid: {formik.isValid ? "כן" : "לא"}
                      <br />
                      ✏️ Dirty: {formik.dirty ? "כן" : "לא"}
                      <br />
                      🔒 Password Score: {passwordStrength.score}/6
                      <br />
                      👆 Touched:{" "}
                      {Object.keys(formik.touched).join(", ") || "אף שדה"}
                      <br />❌ Errors:{" "}
                      {Object.keys(formik.errors).join(", ") || "אין שגיאות"}
                      <br />
                      🎯 Form Valid: {isFormValid() ? "כן" : "לא"}
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
          animation: fadeInUp 0.4s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
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
            transform: translateY(-15px);
          }
        }
        
        .is-invalid {
          border-color: #dc3545 !important;
          animation: shake 0.6s ease-in-out;
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
            transform: translateX(-8px);
          }
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .password-requirement {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .password-requirement.text-success {
          animation: checkmark 0.4s ease-in-out;
        }
        
        @keyframes checkmark {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .progress-bar {
          transition: width 0.4s ease-in-out, background-color 0.3s ease;
        }
        
        .position-relative input:focus + i {
          color: #17a2b8 !important;
          transition: color 0.3s ease;
        }
        
        .card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        
        .rounded-4 {
          border-radius: 1rem !important;
        }
        
        .text-gradient-info {
          background: linear-gradient(135deg, #17a2b8, #007bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default Register;