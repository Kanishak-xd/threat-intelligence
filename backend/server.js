// server.js
const express = require("express");
const cors = require("cors"); // enable CORS so frontend can fetch
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Log environment status
console.log('Server starting...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5050);
console.log('AbuseIPDB API Key:', process.env.ABUSEIPDB_API_KEY ? 
  process.env.ABUSEIPDB_API_KEY.substring(0, 5) + '...' : 'Not set');

const app = express();
const PORT = process.env.PORT || 5050;
const OTX_API_KEY = process.env.OTX_API_KEY;
const OTX_PULSE_ID = process.env.OTX_PULSE_ID;

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'https://threat-intelligence-pkiv.onrender.com', 'https://threat-intelligence.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

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

    console.log('Making AbuseIPDB API request...');
    console.log('API Key:', process.env.ABUSEIPDB_API_KEY ? 
      process.env.ABUSEIPDB_API_KEY.substring(0, 5) + '...' : 'Not set');

    const response = await fetch("https://api.abuseipdb.com/api/v2/blacklist", {
      method: 'GET',
      headers: {
        'Key': process.env.ABUSEIPDB_API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AbuseIPDB API Error Response:', errorText);
      
      if (response.status === 429) {
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
      throw new Error(`AbuseIPDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched data from AbuseIPDB');
    
    if (!data || !data.data) {
      throw new Error('Invalid response format from AbuseIPDB API');
    }

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
    console.error("Full error:", error);
    
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
    res.status(500).json({ 
      error: "Failed to fetch AbuseIPDB data", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- http://localhost:${PORT}/api/abuseipdb`);
  console.log(`- http://localhost:${PORT}/api/logs`);
  console.log(`- http://localhost:${PORT}/api/heading`);
});
