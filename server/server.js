// ---------------- IMPORTS ----------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

// ---------------- APP ----------------
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

// ---------------- HTTP SERVER ----------------
const server = http.createServer(app);

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global._io = io;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinTrip", (tripId) => {
    socket.join(tripId);
  });

  socket.on("leaveTrip", (tripId) => {
    socket.leave(tripId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ---------------- ROUTES ----------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/trips", require("./routes/trips"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/itinerary", require("./routes/itinerary"));

// ---------------- DATABASE ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING → http://localhost:${PORT}`);
});
