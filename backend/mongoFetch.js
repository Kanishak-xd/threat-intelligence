require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT;

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const collections = [
  "auth",
  "downloads",
  "event",
  "input",
  "sensors",
  "sessions",
];

// Fetch & store logs in logs.json
async function fetchLogs() {
  try {
    console.log("Fetching logs from MongoDB...");

    let allLogs = {};

    for (let collection of collections) {
      const Model = mongoose.model(
        collection,
        new mongoose.Schema({}, { strict: false }),
        collection
      );
      const logs = await Model.find();
      allLogs[collection] = logs;
    }

    fs.writeFileSync("logs.json", JSON.stringify(allLogs, null, 2));
    console.log("Logs saved to logs.json");
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
}

fetchLogs();
setInterval(fetchLogs, 1 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running @ ${PORT}`);
});
