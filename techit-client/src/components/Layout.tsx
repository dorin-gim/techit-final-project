import { FunctionComponent, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  containerFluid?: boolean;
  className?: string;
  title?: string;
}

const Layout: FunctionComponent<LayoutProps> = ({ 
  children, 
  showNavbar = true, 
  showFooter = true,
  containerFluid = false,
  className = "",
  title
}) => {
  // Set the document title if provided
  if (title) {
    document.title = `${title} - TechIt`;
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${className}`}>
      {showNavbar && <Navbar />}
      
      <main className="flex-grow-1">
        <div className={containerFluid ? "container-fluid" : "container"}>
          {title && (
            <div className="my-4">
              <h1 className="display-5">{title}</h1>
              <hr />
            </div>
          )}
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;