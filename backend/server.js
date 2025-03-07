require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI; // Add this in your .env file

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Honeypot Logs Schema
const honeypotLogSchema = new mongoose.Schema({
  ip: String,
  timestamp: Date,
  attackType: String,
  details: String,
});

// Model
const HoneypotLog = mongoose.model("HoneypotLog", honeypotLogSchema);

// API route to fetch logs
app.get("/api/logs", async (req, res) => {
  try {
    const logs = await HoneypotLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error });
  }
});

app.get("/api/test-data", async (req, res) => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    res.json(data.slice(0, 5)); // Only send first 5 posts
  } catch (error) {
    res.status(500).json({ message: "Error fetching test data", error });
  }
});

// Test API route
app.get("/", (req, res) => {
  res.send("Backend is running and connected to MongoDB!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
