// MUST be first import - loads environment variables
import "./config/env.js";

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";

import chatRoutes from "./routes/chat.routes.js";
import campsiteRoutes from "./routes/campsite.routes.js";
import tripRoutes from "./routes/trip.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;
const UI_URL = process.env.UI_URL!;

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173", UI_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/chat", chatRoutes);
app.use("/api/campsites", campsiteRoutes);
app.use("/api/trips", tripRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
