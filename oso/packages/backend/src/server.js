// MUST be first import - loads environment variables
import "./config/env.js";

import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";

import chatRoutes from "./routes/chat.routes.js";
import campsiteRoutes from "./routes/campsite.routes.js";
import tripRoutes from "./routes/trip.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/chat", chatRoutes);
app.use("/api/campsites", campsiteRoutes);
app.use("/api/trips", tripRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
