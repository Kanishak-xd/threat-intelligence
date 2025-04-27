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

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Router>
      <div className="App">
        <nav className="nav-container">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/home" isDashboardActive={isDashboardActive}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/home#dashboard" onClick={scrollToDashboard} isDashboardActive={isDashboardActive}>Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/apintel" isDashboardActive={isDashboardActive}>API</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" isDashboardActive={isDashboardActive}>About</NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={
            <>
              <HeroSection onExploreClick={scrollToDashboard} />
              <div ref={dashboardRef} className="home-container">
                <AttackChart />
              </div>
            </>
          } />
          <Route path="/apintel" element={<Apintel />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
