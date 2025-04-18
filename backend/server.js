// server.js
const express = require("express");
const cors = require("cors"); // enable CORS so frontend can fetch
const fetch = require("node-fetch");
const app = express();
const PORT = 3001;
const OTX_API_KEY = "0e69f8728e0b29218b8b2b93bc489aab6498a3760a3dc75e4b0003f808b419fc";
const OTX_PULSE_ID = "6341d1aa0a02a3f6251ab540";
app.use(cors());

app.get("/api/heading", async (req, res) => {
  try {
    const response = await fetch(`https://otx.alienvault.com/api/v1/pulses/${OTX_PULSE_ID}`, {
      headers: {
        "X-OTX-API-KEY": OTX_API_KEY,
      },
    });

    const data = await response.json();
    const domains = data.indicators
      .filter(indicator => indicator.type === "domain")
      .map(indicator => indicator.indicator);

    // Just grab first 5 domains for display
    const displayedDomains = domains.slice(0, 5).join(", ");

    const heading = `Here are some known phishing domains from OTX: ${displayedDomains}`;
    res.json({ heading });
  } catch (error) {
    console.error("Error fetching from OTX API:", error);
    res.status(500).json({ heading: "Failed to fetch phishing domains." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
