import { RequestHandler } from "express";
import { auth0Login } from "../auth";
import { logEvent } from "../logger";

export const handleLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  await logEvent(`/api/login request received email=${email}`);

  if (!email || typeof email !== "string") {
    await logEvent("/api/login validation failed: email is required");
    return res.status(400).json({ error: "Email is required" });
  }

  if (!password || typeof password !== "string") {
    await logEvent("/api/login validation failed: password is required");
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const auth0Response = await auth0Login(email, password);
    await logEvent(`/api/login succeeded email=${email}`);
    return res.status(200).json(auth0Response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    await logEvent(`/api/login failed email=${email} error=${message}`);
    return res.status(401).json({ error: message });
  }
};
