import { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { URL } from "node:url";
import { logEvent } from "./logger";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? "";
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? "";
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET ?? "";
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE ?? "";
const AUTH0_ISSUER = AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN}/` : "";
const AUTH0_JWKS_URL = AUTH0_ISSUER ? `${AUTH0_ISSUER}.well-known/jwks.json` : "";

function assertAuth0Config() {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_AUDIENCE) {
    throw new Error(
      "Missing Auth0 configuration. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, and AUTH0_AUDIENCE."
    );
  }
}

const jwks = AUTH0_JWKS_URL ? createRemoteJWKSet(new URL(AUTH0_JWKS_URL)) : null;

declare global {
  namespace Express {
    interface Request {
      auth0Payload?: JWTPayload;
    }
  }
}

export async function auth0Login(email: string, password: string) {
  assertAuth0Config();

  const tokenUrl = `${AUTH0_ISSUER}oauth/token`;
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "password",
      username: email,
      password,
      audience: AUTH0_AUDIENCE,
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      scope: "openid profile email",
    }),
  });

  const payload = await response.text();
  let data: any;
  try {
    data = JSON.parse(payload);
  } catch {
    throw new Error(`Auth0 login returned invalid JSON: ${payload}`);
  }

  if (!response.ok) {
    const auth0Error = data.error_description || data.error || "Auth0 login failed";
    throw new Error(auth0Error);
  }

  await logEvent(`/auth0/login succeeded email=${email}`);
  return data;
}

export async function verifyAuth0Jwt(token: string) {
  assertAuth0Config();
  if (!jwks) {
    throw new Error("JWKS URL is not configured");
  }

  const verified = await jwtVerify(token, jwks, {
    issuer: AUTH0_ISSUER,
    audience: AUTH0_AUDIENCE,
  });

  return verified.payload;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const payload = await verifyAuth0Jwt(token);
    req.auth0Payload = payload;
    return next();
  } catch (err) {
    await logEvent(`JWT validation failed: ${err instanceof Error ? err.message : String(err)}`);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
