import { FunctionComponent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { getFavoritesStats } from "../services/favoritesService";
import { getPayloadFromToken } from "../services/usersService";

interface FavoriteStat {
  _id: string;
  productName: string;
  productCategory: string;
  favoriteCount: number;
}

interface FavoritesStatsProps {}

const FavoritesStats: FunctionComponent<FavoritesStatsProps> = () => {
  const [stats, setStats] = useState<FavoriteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"count" | "name" | "category">("count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    // Check if user is admin
    try {
      const payload = getPayloadFromToken();
      if (!payload.isAdmin) {
        toast.error("אין לך הרשאה לגשת לדף זה");
        window.location.href = "/home";
        return;
      }
    } catch (error) {
      toast.error("שגיאה בהרשאות");
      window.location.href = "/";
      return;
    }

    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getFavoritesStats();
      setStats(response || []);
    } catch (error: any) {
      toast.error(
        "שגיאה בטעינת סטטיסטיקות המועדפים: " +
          (error.response?.data || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getSortedStats = () => {
    return [...stats].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "count":
          comparison = a.favoriteCount - b.favoriteCount;
          break;
        case "name":
          comparison = a.productName.localeCompare(b.productName, "he");
          break;
        case "category":
          comparison = a.productCategory.localeCompare(b.productCategory, "he");
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (field: "count" | "name" | "category") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: "count" | "name" | "category") => {
    if (sortBy !== field) return <i className="fas fa-sort text-muted"></i>;
    return sortOrder === "asc" ? (
      <i className="fas fa-sort-up text-info"></i>
    ) : (
      <i className="fas fa-sort-down text-info"></i>
    );
  };

  const getTotalFavorites = () => {
    return stats.reduce((total, stat) => total + stat.favoriteCount, 0);
  };

  const getPopularityLevel = (count: number, maxCount: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80)
      return { level: "גבוהה מאוד", color: "success", icon: "fire" };
    if (percentage >= 60)
      return { level: "גבוהה", color: "warning", icon: "star" };
    if (percentage >= 40)
      return { level: "בינונית", color: "info", icon: "thumbs-up" };
    if (percentage >= 20)
      return { level: "נמוכה", color: "secondary", icon: "heart" };
    return { level: "נמוכה מאוד", color: "light", icon: "heart" };
  };

  if (loading) {
    return (
      <Layout title="סטטיסטיקות מועדפים">
        <div className="text-center py-5">
          <div
            className="spinner-border text-info"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-3 text-muted">טוען סטטיסטיקות...</p>
        </div>
      </Layout>
    );
  }

  const sortedStats = getSortedStats();
  const maxCount = Math.max(...stats.map((s) => s.favoriteCount));
  const totalFavorites = getTotalFavorites();

  return (
    <Layout title="סטטיסטיקות מועדפים">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">סה"כ מוצרים במועדפים</h6>
                  <h3 className="mb-0">{stats.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-heart fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">סה"כ מועדפים</h6>
                  <h3 className="mb-0">{totalFavorites}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-star fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">מוצר הכי פופולרי</h6>
                  <h3 className="mb-0">{maxCount}</h3>
                  <small>
                    {stats.find((s) => s.favoriteCount === maxCount)
                      ?.productName || "אין"}
                  </small>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-fire fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="fas fa-chart-bar me-2"></i>
            מועדפים לפי מוצרים
          </h5>
        </div>
        <div className="card-body">
          {sortedStats.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th
                      className="sortable-header"
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      שם המוצר {getSortIcon("name")}
                    </th>
                    <th
                      className="sortable-header"
                      onClick={() => handleSort("category")}
                      style={{ cursor: "pointer" }}
                    >
                      קטגוריה {getSortIcon("category")}
                    </th>
                    <th
                      className="sortable-header"
                      onClick={() => handleSort("count")}
                      style={{ cursor: "pointer" }}
                    >
                      כמות מועדפים {getSortIcon("count")}
                    </th>
                    <th>רמת פופולריות</th>
                    <th>אחוז מהכלל</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((stat, index) => {
                    const popularity = getPopularityLevel(
                      stat.favoriteCount,
                      maxCount
                    );
                    const percentage = (
                      (stat.favoriteCount / totalFavorites) *
                      100
                    ).toFixed(1);

                    return (
                      <tr key={stat._id}>
                        <td className="fw-bold">{stat.productName}</td>
                        <td>
                          <span className="badge bg-info">
                            {stat.productCategory}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2 fw-bold">
                              {stat.favoriteCount}
                            </span>
                            <div
                              className="progress"
                              style={{ width: "100px", height: "8px" }}
                            >
                              <div
                                className={`progress-bar bg-${popularity.color}`}
                                style={{
                                  width: `${
                                    (stat.favoriteCount / maxCount) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${popularity.color}`}>
                            <i className={`fas fa-${popularity.icon} me-1`}></i>
                            {popularity.level}
                          </span>
                        </td>
                        <td>{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">אין נתונים להציגה</h5>
              <p className="text-muted">לא נמצאו מועדפים במערכת</p>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-lightbulb me-2"></i>
            הסבר על הנתונים
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>רמות פופולריות:</h6>
              <ul className="list-unstyled">
                <li>
                  <span className="badge bg-success me-2">גבוהה מאוד</span>80%+
                  מהמקסימום
                </li>
                <li>
                  <span className="badge bg-warning me-2">גבוהה</span>60-79%
                  מהמקסימום
                </li>
                <li>
                  <span className="badge bg-info me-2">בינונית</span>40-59%
                  מהמקסימום
                </li>
                <li>
                  <span className="badge bg-secondary me-2">נמוכה</span>20-39%
                  מהמקסימום
                </li>
                <li>
                  <span className="badge bg-light text-dark me-2">
                    נמוכה מאוד
                  </span>
                  מתחת ל-20%
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>פעולות אפשריות:</h6>
              <ul className="list-unstyled">
                <li>
                  <i className="fas fa-sort text-info me-2"></i>לחץ על כותרות
                  הטבלה למיון
                </li>
                <li>
                  <i className="fas fa-chart-line text-success me-2"></i>עקוב
                  אחר מגמות פופולריות
                </li>
                <li>
                  <i className="fas fa-bullhorn text-warning me-2"></i>קדם
                  מוצרים פחות פופולריים
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FavoritesStats;
