import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const initialValue = location.pathname === "/";

  const [isHome, setIsHome] = useState(initialValue);

  useEffect(() => {
    if (location.pathname === "/") {
      setIsHome(true);
    } else {
      setIsHome(false);
    }
  }, [location.pathname]);

  return (
    <footer className={`footer${isHome ? " home-footer" : ""}`}>
      <div className="container p-4">
        <div className="row">
          <div className="col text-center">
            <p className="copyrights">
              © 2021 TARIQ LAMIN GUESRI. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
        {/* GitHub link removed from landing/footer per request */}
      </div>
    </footer>
  );
};

export default Footer;
