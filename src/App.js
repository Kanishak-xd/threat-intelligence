import React, { useEffect, useState } from "react";

function App() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    fetch("https://threat-intelligence-214n.onrender.com/api/threat-intel")
      .then((res) => res.json())
      .then((data) => {
        setThreats(data.results.slice(0, 5)); // Display only top 5 threats
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Threat Intelligence Dashboard</h1>
      <h2>Recent Threats</h2>
      <ul>
        {threats.map((threat, index) => (
          <li key={index}>{threat.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
