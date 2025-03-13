require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT;

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Database Collections
const collections = [
  "auth",
  "downloads",
  "event",
  "input",
  "sensors",
  "sessions",
];

// Define models only once
const models = {};
collections.forEach((collection) => {
  models[collection] = mongoose.model(
    collection,
    new mongoose.Schema({}, { strict: false }),
    collection
  );
});

// Extract useful info & save to logs.json
async function fetchAndFilterLogs() {
  try {
    console.log("Fetching and filtering logs...");

    let filteredLogs = [];

    for (let collection of collections) {
      const logs = await models[collection].find();

      logs.forEach((log) => {
        let extractedLog = {
          timestamp: log.timestamp || "N/A",
          src_ip: log.src_ip || "Unknown",
          eventid: log.eventid || "Unknown",
          message: log.message || "No message",
          session: log.session || "No session",
        };

        // If from "auth", include username & password
        if (collection === "auth") {
          extractedLog.username = log.username || "Unknown";
          extractedLog.password = log.password || "Unknown";
        }

        // If from "downloads", include filename
        if (collection === "downloads") {
          extractedLog.filename = log.filename || "Unknown";
        }

        // Extract filename from message for file uploads
        if (log.eventid === "cowrie.session.file_upload" && log.message) {
          const match = log.message.match(/Uploaded file \"(.*?)\"/);
          extractedLog.filename = match ? match[1] : "Unknown";
        }

        filteredLogs.push(extractedLog);
      });
    }

    fs.writeFileSync("logs.json", JSON.stringify(filteredLogs, null, 2));
    console.log("Logs saved to logs.json");
  } catch (error) {
    console.error("Error processing logs:", error);
  }
}

fetchAndFilterLogs();
setInterval(fetchAndFilterLogs, 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running @ ${PORT}`);
});
