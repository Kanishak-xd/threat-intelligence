/*const { MongoClient } = require("mongodb");
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
*/
// server.js

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();

console.log("Server starting...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Port:", process.env.PORT || 5050);
console.log(
  "AbuseIPDB API Key:",
  process.env.ABUSEIPDB_API_KEY
    ? process.env.ABUSEIPDB_API_KEY.substring(0, 5) + "..."
    : "Not set"
);

const app = express();
const PORT = process.env.PORT || 5050;

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://threat-intelligence-pkiv.onrender.com",
    "https://clinquant-malabi-d5e957.netlify.app"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static logs from processed_logs.json
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

// AbuseIPDB endpoint with rate limiting + MongoDB caching
let lastAbuseIPDBRequest = 0;
let lastCacheTime = 0;
const ABUSEIPDB_RATE_LIMIT = 1000;
const CACHE_DURATION = 5 * 60 * 1000;

app.get("/api/abuseipdb", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    await client.connect();
    const db = client.db("HoneyData");
    const collection = db.collection("blacklisted_ips");

    const now = Date.now();
    const isCacheValid = now - lastCacheTime < CACHE_DURATION;
    const count = await collection.countDocuments();

    if (count > 0 && isCacheValid) {
      const data = await collection.find().skip(skip).limit(limit).toArray();
      return res.json({ data, total: count, page, limit });
    }

    // Enforce rate limiting
    if (now - lastAbuseIPDBRequest < ABUSEIPDB_RATE_LIMIT) {
      await new Promise(resolve =>
        setTimeout(resolve, ABUSEIPDB_RATE_LIMIT - (now - lastAbuseIPDBRequest))
      );
    }
    lastAbuseIPDBRequest = now;

    const response = await fetch(
      "https://api.abuseipdb.com/api/v2/blacklist",
      {
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AbuseIPDB API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const abuseData = result.data;

    if (abuseData && abuseData.length > 0) {
      await collection.deleteMany({});
      await collection.insertMany(abuseData);
      lastCacheTime = Date.now();
    }

    const paginated = abuseData.slice(skip, skip + limit);
    res.json({ data: paginated, total: abuseData.length, page, limit });

  } catch (error) {
    console.error("[AbuseIPDB] Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch or cache data",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  } finally {
    try {
      await client.close();
    } catch (err) {
      console.error("[AbuseIPDB] Error closing MongoDB connection:", err);
    }
  }
});

// IP Search - AbuseIPDB
app.get("/api/abuseipdb/search", async (req, res) => {
  const ip = req.query.ip;
  if (!ip) return res.status(400).json({ error: "Missing IP address" });

  try {
    const now = Date.now();
    if (now - lastAbuseIPDBRequest < ABUSEIPDB_RATE_LIMIT) {
      await new Promise(resolve =>
        setTimeout(resolve, ABUSEIPDB_RATE_LIMIT - (now - lastAbuseIPDBRequest))
      );
    }
    lastAbuseIPDBRequest = now;

    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`,
      {
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching IP report from AbuseIPDB:", error.message);
    res.status(500).json({ error: "Failed to fetch IP report" });
  }
});

// ✅ OTX Pulse Info - NO API KEY REQUIRED
app.get("/api/heading", async (req, res) => {
  try {
    const response = await fetch(
      "https://otx.alienvault.com/api/v1/pulses/6341d1aa0a02a3f6251ab540"
    );

    if (!response.ok) {
      throw new Error(`OTX API error: ${response.statusText}`);
    }

    const data = await response.json();

    const phishingData = {
      name: data.name,
      description: data.description,
      indicators: data.indicators
        .filter(indicator => indicator.type === "domain")
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Endpoints:`);
  console.log(`- http://localhost:${PORT}/api/abuseipdb`);
  console.log(`- http://localhost:${PORT}/api/logs`);
  console.log(`- http://localhost:${PORT}/api/heading`);
});
