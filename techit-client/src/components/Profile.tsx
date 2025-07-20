import { FunctionComponent, useEffect, useState } from "react";
import Layout from "./Layout";
import { getUserById } from "../services/usersService";
import { User } from "../interfaces/User";

interface ProfileProps {}

const Profile: FunctionComponent<ProfileProps> = () => {
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  useEffect(() => {
    getUserById()
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  
  return (
    <Layout title="הפרופיל שלי">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                פרטים אישיים
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">שם מלא:</label>
                    <p className="form-control-plaintext">{user.name || "לא צוין"}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">אימייל:</label>
                    <p className="form-control-plaintext">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">סטטוס משתמש:</label>
                <div>
                  {user.isAdmin ? (
                    <span className="badge bg-success fs-6">
                      <i className="fas fa-crown me-1"></i>
                      משתמש מנהל
                    </span>
                  ) : (
                    <span className="badge bg-primary fs-6">
                      <i className="fas fa-user me-1"></i>
                      משתמש רגיל
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-warning">
                  <i className="fas fa-edit me-2"></i>
                  ערוך פרטים
                </button>
                <button className="btn btn-secondary">
                  <i className="fas fa-key me-2"></i>
                  שנה סיסמה
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;