import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleRegister } from "./routes/register";
import { handleLogin } from "./routes/login";
import { handleMe } from "./routes/me";
import { handleClientLog, handleReadLogs } from "./routes/logs";
import { logEvent } from "./logger";
import { requireAuth } from "./auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, _res, next) => {
    void logEvent(`REQUEST ${req.method} ${req.url}`);
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/register", handleRegister);
  app.post("/api/login", handleLogin);
  app.get("/api/me", requireAuth, handleMe);
  app.post("/api/log", handleClientLog);
  app.get("/api/logs", handleReadLogs);

  app.all(/^\/api\/.*$/, (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  return app;
}
