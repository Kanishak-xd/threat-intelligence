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

// Define Schema
const CowrieSchema = new mongoose.Schema({}, { strict: false });
const Cowrie = mongoose.model("Cowrie", CowrieSchema, "auth");

// Fetch & store logs in logs.json
async function fetchLogs() {
  try {
    console.log("Fetching logs from MongoDB...");
    const logs = await Cowrie.find().limit(10);

    if (logs.length === 0) {
      console.log("No logs found");
      return;
    }

    fs.writeFileSync("logs.json", JSON.stringify(logs, null, 2));
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
