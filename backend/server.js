// server.js
const express = require("express");
const cors = require("cors"); // enable CORS so frontend can fetch

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/api/paragraph", (req, res) => {
  const paragraph = "Paragraph from Express.js Backend";
  res.json({ paragraph });
});

app.get("/api/heading", (req, res) => {
  const heading = "Heading from Express.js Backend";
  res.json({ heading });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
