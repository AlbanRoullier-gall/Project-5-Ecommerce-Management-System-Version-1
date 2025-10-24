import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { exportRoutes } from "./routes/export";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3040;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api", exportRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "pdf-export-service" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(`PDF Export Service running on port ${PORT}`);
});
