require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const CowrieSchema = new mongoose.Schema({}, { strict: false });
const Cowrie = mongoose.model("Cowrie", CowrieSchema, "cowrie");

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

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
