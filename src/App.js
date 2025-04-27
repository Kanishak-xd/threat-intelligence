import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Apintel from "./apintel";
import AttackChart from "./components/AttackChart";
import HeroSection from "./components/HeroSection";
import About from "./components/About";
import "./App.css";

function NavLink({ to, children, onClick, isDashboardActive }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const handleClick = (e) => {
    if (to === '/home') {
      e.preventDefault();
      window.location.href = '/home';
    }
    if (onClick) onClick(e);
  };
  
  return (
    <Link 
      to={to} 
      className={`nav-link ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

function App() {
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (dashboardRef.current) {
        const rect = dashboardRef.current.getBoundingClientRect();
        setIsDashboardActive(rect.top <= 200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-links">
            <NavLink to="/home" isDashboardActive={isDashboardActive}>Home</NavLink>
            <NavLink to="/apintel" isDashboardActive={isDashboardActive}>IP Intelligence</NavLink>
            <NavLink to="/attack-chart" isDashboardActive={isDashboardActive}>Attack Chart</NavLink>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={
            <div ref={dashboardRef}>
              <HeroSection />
              <About />
            </div>
          } />
          <Route path="/apintel" element={<Apintel />} />
          <Route path="/attack-chart" element={<AttackChart />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
