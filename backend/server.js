require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT;

const EC2_IP = process.env.EC2_IP;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const LOG_PATH = "/srv/cowrie/log/cowrie.json";
const LOCAL_LOG_COPY = "cowrie.json";

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schema
const CowrieSchema = new mongoose.Schema({}, { strict: false });
const Cowrie = mongoose.model("Cowrie", CowrieSchema, "cowrie");

// Function to fetch logs via SCP
function fetchCowrieLogs() {
  console.log("Fetching logs from Cowrie...");
  const scpCommand = `scp -i ${PRIVATE_KEY} ubuntu@${EC2_IP}:${LOG_PATH} ${LOCAL_LOG_COPY}`;

  exec(scpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error fetching logs:", stderr);
      return;
    }
    console.log("Logs fetched successfully:", stdout);
  });
}

// Fetch logs every 5 minutes
setInterval(fetchCowrieLogs, 5 * 60 * 1000);

// API to fetch and store logs in MongoDB
app.get("/api/fetch-cowrie-logs", async (req, res) => {
  try {
    const fileData = fs.readFileSync(LOCAL_LOG_COPY, "utf-8");
    if (!fileData) throw new Error("Empty log file");
    const logs = JSON.parse(fileData);
    if (!Array.isArray(logs))
      throw new Error("Logs are not in an array format");

    await Cowrie.insertMany(logs);
    console.log("Logs inserted into MongoDB");
    res.json({ message: "Logs fetched and stored successfully!" });
  } catch (error) {
    console.error("Error processing logs:", error);
    res.status(500).json({ message: "Error fetching logs", error });
  }
});

// API to retrieve logs from MongoDB
app.get("/api/cowrie-data", async (req, res) => {
  try {
    const data = await Cowrie.find().limit(5);
    console.log("Fetched cowrie data:", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching cowrie data:", error);
    res.status(500).json({ message: "Error fetching data", error });
  }
});

// Test API route
app.get("/", (req, res) => {
  res.send("Backend is running and connected to MongoDB!");
});

app.listen(PORT, () => {
  console.log(`Server running @ ${PORT}`);
});
