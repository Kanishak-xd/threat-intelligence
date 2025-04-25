require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGO_URI = process.env.MONGO_URI;
const BATCH_SIZE = 1000; // Number of documents to fetch per batch
const MAX_RETRIES = 3; // Maximum number of retries for failed operations

// Connect to MongoDB
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

// Helper function to extract useful information from a log
function extractLogInfo(log, collection) {
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

  return extractedLog;
}

// Function to fetch data with pagination
async function fetchCollectionWithPagination(collection, model) {
  let allLogs = [];
  let lastId = null;
  let hasMore = true;
  let retryCount = 0;

  while (hasMore && retryCount < MAX_RETRIES) {
    try {
      const query = lastId ? { _id: { $gt: lastId } } : {};
      const logs = await model
        .find(query)
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .lean();

      if (logs.length === 0) {
        hasMore = false;
      } else {
        const processedLogs = logs.map(log => extractLogInfo(log, collection));
        allLogs = allLogs.concat(processedLogs);
        lastId = logs[logs.length - 1]._id;
        console.log(`Fetched ${logs.length} logs from ${collection}, total: ${allLogs.length}`);
      }
      retryCount = 0; // Reset retry count on successful fetch
    } catch (error) {
      console.error(`Error fetching from ${collection}:`, error);
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        console.error(`Max retries reached for ${collection}, moving to next collection`);
        break;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  return allLogs;
}

// Main function to fetch and process all logs
async function fetchAndFilterLogs() {
  try {
    console.log("Starting to fetch and filter logs...");
    const outputFile = path.join(__dirname, "monLogs.json");
    
    // Create or clear the output file
    fs.writeFileSync(outputFile, "[\n");
    let isFirstChunk = true;

    for (const collection of collections) {
      console.log(`Processing collection: ${collection}`);
      const logs = await fetchCollectionWithPagination(collection, models[collection]);
      
      // Append logs to file
      if (logs.length > 0) {
        const jsonString = logs.map(log => JSON.stringify(log)).join(",\n");
        fs.appendFileSync(outputFile, (isFirstChunk ? "" : ",\n") + jsonString);
        isFirstChunk = false;
      }
    }

    // Close the JSON array
    fs.appendFileSync(outputFile, "\n]");
    console.log("All logs saved to monLogs.json");

    // Process the logs file to create a smaller version for visualization
    const processedLogs = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    const visualizationLogs = processedLogs.filter(log => 
      log.eventid === 'cowrie.login.failed' || 
      log.eventid === 'cowrie.login.success' || 
      log.eventid === 'cowrie.session.connect'
    );
    fs.writeFileSync(
      path.join(__dirname, "processed_logs.json"),
      JSON.stringify(visualizationLogs, null, 2)
    );
    console.log("Created processed_logs.json for visualization");

  } catch (error) {
    console.error("Error in main process:", error);
  }
}

// Run the fetch process
fetchAndFilterLogs().then(() => {
  console.log("Fetch process completed");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
