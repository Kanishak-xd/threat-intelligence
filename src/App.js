import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Apintel from "./apintel";
import AttackChart from "./components/AttackChart";
import HeroSection from "./components/HeroSection";
import "./App.css";

function App() {
  const [paragraph, setParagraph] = useState("");
  const dashboardRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/paragraph")
      .then((res) => res.json())
      .then((data) => setParagraph(data.paragraph))
      .catch((err) => console.error("Error fetching paragraph:", err));
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
              <Link to="/home" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/apintel" className="nav-link">Threat Intelligence</Link>
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
