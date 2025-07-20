import { FunctionComponent } from "react";

interface FooterProps {}

const Footer: FunctionComponent<FooterProps> = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5 className="text-info">TechIt</h5>
            <p className="small">
              חנות הטכנולוגיה המובילה  - מוצרים איכותיים במחירים נוחים
            </p>
          </div>
          <div className="col-md-4">
            <h6>צור קשר</h6>
            <ul className="list-unstyled small">
              <li>
                <i className="fa fa-envelope me-2"></i>
                info@techit.co.il
              </li>
              <li>
                <i className="fa fa-phone me-2"></i>
                03-1234567
              </li>
              <li>
                <i className="fa fa-map-marker me-2"></i>
                תל אביב, ישראל
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>עקבו אחרינו</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        <hr className="my-3" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="small mb-0">
              © 2024 TechIt. כל הזכויות שמורות.
            </p>
          </div>
          <div className="col-md-6 text-end">
            <p className="small mb-0">
              נבנה ע"י <strong>דורין גימפל גל</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;