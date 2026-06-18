import crypto from "crypto";
import { Router } from "express";
import { Profile } from "../models/Profile.js";
import { requireDb } from "../middleware/clientId.js";
import { createJwt, hashPassword, verifyPassword } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function sanitizeProfile(profile) {
  if (!profile) return null;
  const plain = profile.toJSON ? profile.toJSON() : { ...profile };
  delete plain.passwordHash;
  return plain;
}

router.post("/register", requireDb, async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();

    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const usernameLower = username.toLowerCase();
    const existing = await Profile.findOne({ usernameLower });
    if (existing) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    const userId = crypto.randomUUID();
    const profile = await Profile.create({
      userId,
      clientId: userId,
      username,
      usernameLower,
      passwordHash: hashPassword(password),
    });

    const token = createJwt({
      sub: profile.userId,
      username: profile.username,
    });

    res.status(201).json({
      token,
      user: sanitizeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", requireDb, async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const profile = await Profile.findOne({ usernameLower: username.toLowerCase() });
    if (!profile || !verifyPassword(password, profile.passwordHash)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = createJwt({
      sub: profile.userId,
      username: profile.username,
    });

    res.json({
      token,
      user: sanitizeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireDb, requireAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.auth.sub });
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: sanitizeProfile(profile) });
  } catch (error) {
    next(error);
  }
});

export default router;
