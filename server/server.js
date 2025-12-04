import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";

dotenv.config();  // load .env file

const app = express();
connectDB();  // connect MongoDB

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`|| 5000)
);
