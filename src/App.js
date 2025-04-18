import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Apintel from "./apintel";
import AttackChart from "./components/AttackChart";

function App() {
  const [paragraph, setParagraph] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/paragraph")
      .then((res) => res.json())
      .then((data) => setParagraph(data.paragraph))
      .catch((err) => console.error("Error fetching paragraph:", err));
  }, []);

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/apintel">OTX Intelligence</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={
            <div>
              <h1>Threat Intelligence Dashboard</h1>
              <AttackChart />
              <p>{paragraph}</p>
            </div>
          } />
          <Route path="/apintel" element={<Apintel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
