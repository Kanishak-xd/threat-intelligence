import React, { useRef, useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Apintel from "./apintel";
import AttackChart from "./components/AttackChart";
import HeroSection from "./components/HeroSection";
import About from "./components/About";
import "./App.css";

function NavLink({ to, children, onClick, isActive }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (to === "/dashboard") {
      e.preventDefault();
      navigate("/");
      setTimeout(() => {
        const dashboardElement = document.getElementById("dashboard-section");
        dashboardElement?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      onClick?.();
    }
  };

  return (
    <Link
      to={to === "/dashboard" ? "/" : to}
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

function App() {
  const dashboardRef = useRef(null);
  const location = useLocation();
  const [activeNavLink, setActiveNavLink] = useState("/");

  const scrollToDashboard = useCallback(() => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
    setActiveNavLink("/dashboard-section"); // Use a specific identifier for the dashboard section
  }, [dashboardRef]);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      scrollToDashboard();
    } else {
      setActiveNavLink(location.pathname);
    }

    const handleScroll = () => {
      if (dashboardRef.current) {
        const rect = dashboardRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          setActiveNavLink("/dashboard-section");
        } else if (window.scrollY === 0) {
          setActiveNavLink("/");
        } else if (activeNavLink === "/dashboard-section" && (rect.top > window.innerHeight / 2 || rect.bottom < window.innerHeight / 2)) {
          setActiveNavLink("/"); // Revert to Home if scrolled away from dashboard
        }
      } else if (window.scrollY === 0) {
        setActiveNavLink("/");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location, scrollToDashboard, dashboardRef, activeNavLink]);

  const handleNavLinkClick = (path) => {
    setActiveNavLink(path);
    if (path !== "/dashboard-section") {
      // Reset scroll-based active state if navigating away
      const dashboardElement = document.getElementById("dashboard-section");
      if (dashboardElement && path === "/") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="App">
      <nav className="nav-container">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/"
              onClick={() => handleNavLinkClick("/")}
              isActive={activeNavLink === "/"}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/dashboard"
              scrollToDashboard={scrollToDashboard}
              isActive={activeNavLink === "/dashboard-section"}
            >
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/apintel"
              onClick={() => handleNavLinkClick("/apintel")}
              isActive={activeNavLink === "/apintel"}
            >
              API
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/about"
              onClick={() => handleNavLinkClick("/about")}
              isActive={activeNavLink === "/about"}
            >
              About
            </NavLink>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection onExploreClick={scrollToDashboard} />
              <div ref={dashboardRef} className="home-container" id="dashboard-section">
                <AttackChart />
              </div>
            </>
          }
        />
        <Route path="/apintel" element={<Apintel />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}