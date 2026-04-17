const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const chatRoutes = require("./routes/chat.route");


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("API running");
});

module.exports = app;