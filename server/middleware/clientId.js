import mongoose from "mongoose";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function clientIdMiddleware(req, res, next) {
  const id = req.headers["x-client-id"];
  if (!id || typeof id !== "string" || !UUID_RE.test(id.trim())) {
    return res.status(400).json({
      error: "Missing or invalid X-Client-Id header (UUID).",
    });
  }
  req.clientId = id.trim();
  next();
}

export function requireDb(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database unavailable. Verify MONGODB_URI, Atlas network access, and the server connection logs.",
    });
  }
  next();
}
