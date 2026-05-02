import { RequestHandler } from "express";
import { logEvent } from "../logger";

export const handleRegister: RequestHandler = async (req, res) => {
  const { name, subdomain, password } = req.body;

  await logEvent(
    `/api/register request received name=${name} subdomain=${subdomain} passwordProvided=${
      typeof password === "string" && password.length > 0
    }`
  );

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Company name is required" });
  }

  if (!subdomain || typeof subdomain !== "string") {
    return res.status(400).json({ error: "Subdomain is required" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return res.status(400).json({
      error:
        "Subdomain can only contain lowercase letters, numbers, and hyphens",
    });
  }

  if (subdomain.startsWith("-") || subdomain.endsWith("-")) {
    await logEvent(`/api/register validation failed subdomain invalid: ${subdomain}`);
    return res
      .status(400)
      .json({ error: "Subdomain cannot start or end with a hyphen" });
  }

  const response = {
    message: "Workspace created successfully",
    tenant: subdomain.toLowerCase(),
  };

  await logEvent(`/api/register succeeded tenant=${subdomain.toLowerCase()}`);
  console.log("✅ /api/register succeeded", response);

  return res.status(201).json(response);
};
