import { FunctionComponent } from "react";
import Layout from "./Layout";

interface HomeProps {}

const Home: FunctionComponent<HomeProps> = () => {
  return (
    <Layout title="ברוכים הבאים">
      <div className="bg-primary text-white text-center py-5 rounded mb-5">
        <div className="container">
          <h1 className="display-4 mb-3">TechIt - חנות הטכנולוגיה שלכם</h1>
          <p className="lead mb-4">מוצרים איכותיים במחירים תחרותיים</p>
          <a href="/products" className="btn btn-light btn-lg">
            צפה במוצרים <i className="fas fa-arrow-left ms-2"></i>
          </a>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 text-center mb-4">
          <i className="fas fa-laptop fa-3x text-info mb-3"></i>
          <h4>לפטופים</h4>
          <p className="text-muted">מגוון רחב של לפטופים למשרד ובית</p>
        </div>
        <div className="col-md-4 text-center mb-4">
          <i className="fas fa-headphones fa-3x text-info mb-3"></i>
          <h4>אוזניות</h4>
          <p className="text-muted">אוזניות איכותיות לחוויית שמע מושלמת</p>
        </div>
        <div className="col-md-4 text-center mb-4">
          <i className="fas fa-mobile-alt fa-3x text-info mb-3"></i>
          <h4>טלפונים</h4>
          <p className="text-muted">הטלפונים החכמים החדישים ביותר</p>
        </div>
      </div>

      <div className="row mt-5 py-4 bg-light rounded">
        <div className="col-md-3 text-center">
          <h3 className="text-info">500+</h3>
          <p className="text-muted">מוצרים</p>
        </div>
        <div className="col-md-3 text-center">
          <h3 className="text-info">10K+</h3>
          <p className="text-muted">לקוחות מרוצים</p>
        </div>
        <div className="col-md-3 text-center">
          <h3 className="text-info">24/7</h3>
          <p className="text-muted">שירות לקוחות</p>
        </div>
        <div className="col-md-3 text-center">
          <h3 className="text-info">2 שנים</h3>
          <p className="text-muted">אחריות</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;