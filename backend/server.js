// server.js
const express = require("express");
const cors = require("cors"); // enable CORS so frontend can fetch
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Use PORT from env or fallback to 3001
const OTX_API_KEY = process.env.OTX_API_KEY;
const OTX_PULSE_ID = process.env.OTX_PULSE_ID;

app.use(cors());

// Serve logs data
app.get("/api/logs", (req, res) => {
  try {
    const logsPath = path.join(__dirname, "processed_logs.json");
    const logsData = JSON.parse(fs.readFileSync(logsPath, "utf8"));
    res.json(logsData);
  } catch (error) {
    console.error("Error reading logs file:", error);
    res.status(500).json({ error: "Failed to read logs data" });
  }
});

// AbuseIPDB endpoint with rate limiting, caching, and pagination
let lastAbuseIPDBRequest = 0;
const ABUSEIPDB_RATE_LIMIT = 1000; // 1 second between requests
let cachedAbuseIPDBData = null;
let lastAbuseIPDBCache = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get("/api/abuseipdb", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check cache first
    const now = Date.now();
    if (cachedAbuseIPDBData && (now - lastAbuseIPDBCache < CACHE_DURATION)) {
      const paginatedData = {
        data: cachedAbuseIPDBData.slice(skip, skip + limit),
        total: cachedAbuseIPDBData.length,
        page,
        limit
      };
      return res.json(paginatedData);
    }

    // Check rate limit
    if (now - lastAbuseIPDBRequest < ABUSEIPDB_RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, ABUSEIPDB_RATE_LIMIT - (now - lastAbuseIPDBRequest)));
    }
    lastAbuseIPDBRequest = Date.now();

    const response = await fetch("https://api.abuseipdb.com/api/v2/blacklist", {
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        // If rate limited, return cached data if available
        if (cachedAbuseIPDBData) {
          const paginatedData = {
            data: cachedAbuseIPDBData.slice(skip, skip + limit),
            total: cachedAbuseIPDBData.length,
            page,
            limit
          };
          return res.json(paginatedData);
        }
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(`AbuseIPDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Update cache
    cachedAbuseIPDBData = data.data;
    lastAbuseIPDBCache = now;

    // Return paginated data
    const paginatedData = {
      data: data.data.slice(skip, skip + limit),
      total: data.data.length,
      page,
      limit
    };
    res.json(paginatedData);
  } catch (error) {
    console.error("Error fetching from AbuseIPDB:", error.message);
    // If we have cached data, return it even if it's expired
    if (cachedAbuseIPDBData) {
      const paginatedData = {
        data: cachedAbuseIPDBData.slice(skip, skip + limit),
        total: cachedAbuseIPDBData.length,
        page,
        limit
      };
      return res.json(paginatedData);
    }
    res.status(500).json({ error: "Failed to fetch AbuseIPDB data" });
  }
});

// OTX API endpoint
app.get("/api/heading", async (req, res) => {
  try {
    const response = await fetch('https://otx.alienvault.com/api/v1/pulses/6341d1aa0a02a3f6251ab540', {
      headers: {
        'X-OTX-API-KEY': process.env.OTX_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OTX API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Send only useful phishing info to frontend
    const phishingData = {
      name: data.name,
      description: data.description,
      indicators: data.indicators
        .filter(indicator => indicator.type === 'domain')
        .map(indicator => ({
          domain: indicator.indicator,
          type: indicator.type,
          created: indicator.created
        }))
    };
    
    res.json(phishingData);
  } catch (error) {
    console.error("Error fetching from OTX API:", error.message);
    res.status(500).json({ error: "Failed to fetch phishing domains." });
  }
});

// Search for specific IP on AbuseIPDB with rate limiting
app.get("/api/abuseipdb/search", async (req, res) => {
  const ip = req.query.ip;
  if (!ip) return res.status(400).json({ error: "Missing IP address" });

  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastAbuseIPDBRequest < ABUSEIPDB_RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, ABUSEIPDB_RATE_LIMIT - (now - lastAbuseIPDBRequest)));
    }
    lastAbuseIPDBRequest = Date.now();

    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`,
      {
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(`AbuseIPDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching IP report from AbuseIPDB:", error.message);
    res.status(500).json({ error: "Failed to fetch IP report" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
