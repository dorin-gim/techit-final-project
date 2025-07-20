import { FunctionComponent } from "react";
import Layout from "./Layout";

interface AboutProps {}

const About: FunctionComponent<AboutProps> = () => {
  return (
    <Layout title="אודות TechIt">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title text-info">
                <i className="fas fa-info-circle me-2"></i>
                מהי TechIt?
              </h3>
              <p className="card-text">
                TechIt היא חנות טכנולוגיה מתקדמת המתמחה במכירת מוצרי טכנולוגיה איכותיים. 
                אנו מציעים מגוון רחב של מוצרים החל מלפטופים, אוזניות, טלפונים חכמים ועד 
                אביזרי מחשב מתקדמים.
              </p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title text-info">
                <i className="fas fa-users me-2"></i>
                איך להתממשק עם האתר?
              </h3>
              <div className="row">
                <div className="col-md-6">
                  <h5><i className="fas fa-user text-primary me-2"></i>למשתמשים רגילים:</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">הרשמה והתחברות למערכת</li>
                    <li className="list-group-item">עיון במוצרים</li>
                    <li className="list-group-item">הוספת מוצרים לסל הקניות</li>
                    <li className="list-group-item">חיפוש וסינון מוצרים</li>
                    <li className="list-group-item">שמירת מוצרים במועדפים</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5><i className="fas fa-user-shield text-warning me-2"></i>למנהלים:</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">הוספת מוצרים חדשים</li>
                    <li className="list-group-item">עריכת פרטי מוצרים</li>
                    <li className="list-group-item">מחיקת מוצרים</li>
                    <li className="list-group-item">ניהול מלאי</li>
                    <li className="list-group-item">ניהול משתמשים</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title text-info">
                <i className="fas fa-code me-2"></i>
                טכנולוגיות בשימוש
              </h3>
              <div className="row">
                <div className="col-md-6">
                  <h6><i className="fas fa-laptop-code me-2"></i>צד לקוח (Frontend):</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-info fs-6">
                      <i className="fab fa-react me-1"></i>React 18
                    </span>
                    <span className="badge bg-warning fs-6">
                      <i className="fab fa-js me-1"></i>TypeScript
                    </span>
                    <span className="badge bg-primary fs-6">
                      <i className="fab fa-bootstrap me-1"></i>Bootstrap 5
                    </span>
                    <span className="badge bg-success fs-6">
                      <i className="fas fa-route me-1"></i>React Router
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6><i className="fas fa-server me-2"></i>צד שרת (Backend):</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-success fs-6">
                      <i className="fab fa-node-js me-1"></i>Node.js
                    </span>
                    <span className="badge bg-secondary fs-6">
                      <i className="fas fa-server me-1"></i>Express.js
                    </span>
                    <span className="badge bg-success fs-6">
                      <i className="fas fa-database me-1"></i>MongoDB
                    </span>
                    <span className="badge bg-warning fs-6">
                      <i className="fas fa-shield-alt me-1"></i>JWT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title text-info">
                <i className="fas fa-envelope me-2"></i>
                צרו קשר
              </h3>
              <p className="card-text">יש לכם שאלות או הצעות? אנו נשמח לשמוע מכם!</p>
              <div className="row">
                <div className="col-md-6">
                  <div className="p-3 border rounded">
                    <i className="fas fa-envelope fa-2x text-info mb-2"></i>
                    <h6>אימייל</h6>
                    <p className="mb-0">info@techit.co.il</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 border rounded">
                    <i className="fas fa-phone fa-2x text-info mb-2"></i>
                    <h6>טלפון</h6>
                    <p className="mb-0">03-1234567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;