import { FunctionComponent, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import Layout from "./Layout";
import { getAllUsers, updateUserRole, deleteUser } from "../services/usersService";
import { getPayloadFromToken } from "../services/usersService";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
}

interface UsersManagementProps {}

const UsersManagement: FunctionComponent<UsersManagementProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    // Check if user is admin
    try {
      const payload = getPayloadFromToken();
      if (!payload.isAdmin) {
        toast.error("אין לך הרשאה לגשת לדף זה");
        window.location.href = '/home';
        return;
      }
      setCurrentUserId(payload._id);
    } catch (error) {
      toast.error("שגיאה בהרשאות");
      window.location.href = '/';
      return;
    }

    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("שגיאה בטעינת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: boolean, userName: string) => {
    if (userId === currentUserId) {
      toast.error("לא ניתן לשנות את ההרשאות של עצמך");
      return;
    }

    if (window.confirm(`האם אתה בטוח שברצונך לשנות את הרשאות ${userName}?`)) {
      try {
        await updateUserRole(userId, newRole);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAdmin: newRole } : user
        ));
        
        const roleText = newRole ? "מנהל" : "משתמש רגיל";
        toast.success(`הרשאות ${userName} שונו ל${roleText}`);
      } catch (error: any) {
        toast.error(error.response?.data || "שגיאה בשינוי הרשאות");
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUserId) {
      toast.error("לא ניתן למחוק את עצמך");
      return;
    }

    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${userName}? פעולה זו אינה ניתנת לביטול!`)) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        toast.success(`המשתמש ${userName} נמחק בהצלחה`);
      } catch (error: any) {
        toast.error(error.response?.data || "שגיאה במחיקת המשתמש");
      }
    }
  };

  if (loading) {
    return (
      <Layout title="ניהול משתמשים">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-3 text-muted">טוען משתמשים...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="ניהול משתמשים">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                רשימת משתמשים ({users.length})
              </h5>
            </div>
            <div className="card-body">
              {users.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>שם</th>
                        <th>אימייל</th>
                        <th>סוג משתמש</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="fw-bold">{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span 
                              className={`badge ${user.isAdmin ? 'bg-warning text-dark' : 'bg-primary'}`}
                            >
                              {user.isAdmin ? (
                                <>
                                  <i className="fas fa-crown me-1"></i>
                                  מנהל
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-user me-1"></i>
                                  משתמש רגיל
                                </>
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {user._id !== currentUserId && (
                                <>
                                  <button
                                    className={`btn btn-sm ${user.isAdmin ? 'btn-secondary' : 'btn-warning'}`}
                                    onClick={() => handleRoleChange(user._id, !user.isAdmin, user.name)}
                                    title={user.isAdmin ? "הפוך למשתמש רגיל" : "הפוך למנהל"}
                                  >
                                    {user.isAdmin ? (
                                      <>
                                        <i className="fas fa-user-minus me-1"></i>
                                        הסר הרשאות
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-user-plus me-1"></i>
                                        הפוך למנהל
                                      </>
                                    )}
                                  </button>
                                  
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                    title="מחק משתמש"
                                  >
                                    <i className="fas fa-trash me-1"></i>
                                    מחק
                                  </button>
                                </>
                              )}
                              
                              {user._id === currentUserId && (
                                <span className="badge bg-success">
                                  <i className="fas fa-check me-1"></i>
                                  זה אתה
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">אין משתמשים למציגה</h5>
                </div>
              )}
            </div>
          </div>
          
          <div className="card mt-4 shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                הערות חשובות
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  לא ניתן לשנות הרשאות או למחוק את עצמך
                </li>
                <li className="mb-2">
                  <i className="fas fa-shield-alt text-info me-2"></i>
                  מנהלים יכולים לגשת לכל הפונקציות באתר
                </li>
                <li className="mb-0">
                  <i className="fas fa-trash text-danger me-2"></i>
                  מחיקת משתמש היא פעולה בלתי הפיכה
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersManagement;