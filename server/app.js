import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import apiRouter from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    cors({
      origin(origin, callback) {
        const isLocalDevOrigin =
          !isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");

        if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.json({
      status: "ok",
      service: "todays-recipe-api",
      db: {
        connected: dbConnected,
        name: mongoose.connection.name || null,
      },
    });
  });

  app.use("/api", apiRouter);
  app.use(errorHandler);

  return app;
}
