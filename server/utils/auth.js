import crypto from "crypto";

const TOKEN_ALGORITHM = "HS256";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function signatureFor(unsignedToken, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function resolveJwtSecret(options = {}) {
  const secret = options.secret || process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return "dev-jwt-secret-change-me";
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (attempt.length !== expected.length) return false;
  return crypto.timingSafeEqual(attempt, expected);
}

export function createJwt(payload, options = {}) {
  const secret = resolveJwtSecret(options);
  const expiresInMs = options.expiresInMs || TOKEN_TTL_MS;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: nowSeconds,
    exp: nowSeconds + Math.floor(expiresInMs / 1000),
  };
  const header = { alg: TOKEN_ALGORITHM, typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = signatureFor(unsignedToken, secret);
  return `${unsignedToken}.${signature}`;
}

export function verifyJwt(token, options = {}) {
  const secret = resolveJwtSecret(options);
  if (!token || typeof token !== "string") {
    throw new Error("Missing token");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed token");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signatureFor(unsignedToken, secret);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid token signature");
  }

  const header = JSON.parse(fromBase64Url(encodedHeader));
  if (header.alg !== TOKEN_ALGORITHM) {
    throw new Error("Unsupported token algorithm");
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSeconds) {
    throw new Error("Token expired");
  }

  return payload;
}
