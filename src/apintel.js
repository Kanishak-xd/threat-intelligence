import React, { useEffect, useState } from "react";

function Apintel() {
  const [heading, setHeading] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/heading")
      .then((res) => res.json())
      .then((data) => setHeading(data.heading))
      .catch((err) => console.error("Error fetching heading", err));
  }, []);

  return (
    <div>
      <h1>OTX Intelligence Dashboard</h1>
      <h2>Phishing Domains from OTX</h2>
      <h3>{heading}</h3>
    </div>
  );
}

export default Apintel; 