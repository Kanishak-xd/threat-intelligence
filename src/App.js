import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Apintel from "./apintel";
import AttackChart from "./components/AttackChart";
import HeroSection from "./components/HeroSection";
import "./App.css";

function NavLink({ to, children, onClick, isDashboardActive, currentPath }) {
  const location = useLocation();
  const isActive = (to === '/home' && currentPath === '/home' && !isDashboardActive) || 
    (to === '/home#dashboard' && isDashboardActive) ||
    (to === '/apintel' && currentPath === '/apintel');
  
  return (
    <Link 
      to={to} 
      className={`nav-link ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function App() {
  const [paragraph, setParagraph] = useState("");
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const [currentPath, setCurrentPath] = useState('/home');
  const dashboardRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/paragraph")
      .then((res) => res.json())
      .then((data) => setParagraph(data.paragraph))
      .catch((err) => console.error("Error fetching paragraph:", err));

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
              <NavLink to="/home" isDashboardActive={isDashboardActive} currentPath={currentPath}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/home#dashboard" onClick={scrollToDashboard} isDashboardActive={isDashboardActive} currentPath={currentPath}>Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/apintel" isDashboardActive={isDashboardActive} currentPath={currentPath}>API</NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={
            <>
              <HeroSection onExploreClick={scrollToDashboard} />
              <div ref={dashboardRef} className="home-container">
                <h1 className="home-title">Threat Intelligence Dashboard</h1>
                <AttackChart />
                <p className="home-paragraph">{paragraph}</p>
              </div>
            </>
          } />
          <Route path="/apintel" element={<Apintel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
