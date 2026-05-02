import { RequestHandler } from "express";

export const handleMe: RequestHandler = (req, res) => {
  return res.json({
    user: req.auth0Payload ?? null,
  });
};
