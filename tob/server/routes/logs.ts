import { RequestHandler } from "express";
import { logEvent, getLogData } from "../logger";

export const handleClientLog: RequestHandler = async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Log message is required" });
  }

  await logEvent(`CLIENT LOG: ${message}`);
  res.status(201).json({ success: true });
};

export const handleReadLogs: RequestHandler = async (_req, res) => {
  const logs = await getLogData();
  res.json({ logs });
};
