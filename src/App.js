import React, { useEffect, useState } from "react";

function App() {
  const [paragraph, setParagraph] = useState("");
  const [heading, setHeading] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/paragraph")
      .then((res) => res.json())
      .then((data) => setParagraph(data.paragraph))
      .catch((err) => console.error("Error fetching paragraph:", err));

    fetch("http://localhost:3001/api/heading")
      .then((res) => res.json())
      .then((data) => setHeading(data.heading))
      .catch((err) => console.error("Error fetching heading", err));
  }, []);
  return (
    <div>
      <h1>Threat Intelligence Dashboard</h1>
      <h2>Heading from React.js Frontend</h2>
      <h3>{heading}</h3>
      <p>{paragraph}</p>
    </div>
  );
}

export default App;
