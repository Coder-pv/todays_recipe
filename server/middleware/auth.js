import { verifyJwt } from "../utils/auth.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    req.auth = verifyJwt(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message || "Invalid token" });
  }
}
