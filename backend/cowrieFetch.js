require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT;

const EC2_IP = process.env.EC2_IP;
const PRIVATE_KEY = `"${process.env.PRIVATE_KEY}"`;
const LOG_PATH = "/opt/cowrie/var/log/cowrie/";
const LOCAL_LOG_COPY = "cowrie.json";

app.use(cors());
app.use(express.json());

// Fetch logs via SCP
function fetchCowrieLogs() {
  console.log("Fetching logs from Cowrie...");
  const scpCommand = `scp -i ${PRIVATE_KEY} ubuntu@${EC2_IP}:${LOG_PATH}cowrie.json ${LOCAL_LOG_COPY}`;

  exec(scpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error fetching logs:", stderr);
      return;
    }
    console.log("Logs fetched successfully", stdout);
  });
}

fetchCowrieLogs();

app.listen(PORT, () => {
  console.log(`Server running @ ${PORT}`);
});
