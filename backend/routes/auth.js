const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const { get, run } = require("../db/db");
const {
  createAccessToken,
  createRefreshToken,
  getRefreshCookieOptions,
  hashToken,
  normalizeEmail,
  normalizeUsername,
  toPublicUser,
  validateLoginPayload,
  validateRegisterPayload,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
} = require("../utils/auth");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken || null;
}

async function createSession(user, req) {
  const sessionId = uuid();
  const refreshToken = createRefreshToken(user, sessionId);
  const accessToken = createAccessToken(user, sessionId);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await run(
    `INSERT INTO auth_sessions
      (id, userId, refreshTokenHash, userAgent, ipAddress, expiresAt, revokedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      sessionId,
      user.id,
      hashToken(refreshToken),
      req.get("user-agent") || null,
      req.ip || null,
      expiresAt,
      now,
      now,
    ]
  );

  return { accessToken, refreshToken };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
}

router.post("/register", async (req, res, next) => {
  try {
    const { valid, errors, values } = validateRegisterPayload(req.body);

    if (!valid) {
      console.warn(`[AUTH] Registration failed: validation error. ${errors.join(", ")}.`);
      return res.status(400).json({ error: "Validation failed.", details: errors });
    }

    const existingUser = await get(
      "SELECT id, email, username FROM users WHERE email = ? OR username = ?",
      [values.email, values.username]
    );

    if (existingUser) {
      const conflictMessage = existingUser.email === values.email
        ? "Email is already in use."
        : "Username is already in use.";

      console.warn(`[AUTH] Registration rejected: ${existingUser.email === values.email ? `email "${values.email}" already in use` : `username "${values.username}" already in use`}.`);
      return res.status(409).json({ error: conflictMessage });
    }

    const now = new Date().toISOString();
    const user = {
      id: uuid(),
      email: normalizeEmail(values.email),
      username: normalizeUsername(values.username),
      passwordHash: await bcrypt.hash(values.password, 12),
      role: "user",
      createdAt: now,
      updatedAt: now,
    };

    await run(
      `INSERT INTO users (id, email, username, passwordHash, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.username, user.passwordHash, user.role, user.createdAt, user.updatedAt]
    );

    const session = await createSession(user, req);
    setRefreshCookie(res, session.refreshToken);

    console.log(`[AUTH] User registered successfully: ${user.username} (${user.email})`);

    return res.status(201).json({
      user: toPublicUser(user),
      accessToken: session.accessToken,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { valid, errors, values } = validateLoginPayload(req.body);

    if (!valid) {
      console.warn(`[AUTH] Login failed: validation error. ${errors.join(", ")}.`);
      return res.status(400).json({ error: "Validation failed.", details: errors });
    }

    const identifier = values.identifier;
    const isEmailLogin = identifier.includes("@");
    const normalizedEmail = normalizeEmail(identifier);
    const normalizedUsername = normalizeUsername(identifier);

    const user = await get(
      isEmailLogin
        ? "SELECT * FROM users WHERE email = ?"
        : "SELECT * FROM users WHERE username = ? OR email = ?",
      isEmailLogin ? [normalizedEmail] : [normalizedUsername, normalizedEmail]
    );

    if (!user) {
      console.warn(`[AUTH] Login rejected for "${identifier}": no matching user account. Check email/username.`);
      return res.status(401).json({ error: "Invalid email/username or password." });
    }

    const passwordMatches = await bcrypt.compare(values.password, user.passwordHash);

    if (!passwordMatches) {
      console.warn(`[AUTH] Login rejected for "${user.username}": invalid password. Check credentials.`);
      return res.status(401).json({ error: "Invalid email/username or password." });
    }

    const now = new Date().toISOString();
    await run("UPDATE users SET lastLoginAt = ?, updatedAt = ? WHERE id = ?", [now, now, user.id]);

    const session = await createSession(user, req);
    setRefreshCookie(res, session.refreshToken);

    console.log(`[AUTH] User logged in: ${user.username}`);

    return res.status(200).json({
      user: toPublicUser({ ...user, lastLoginAt: now, updatedAt: now }),
      accessToken: session.accessToken,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      console.warn(`[AUTH] Token refresh failed: no refresh token in request. User must log in again.`);
      return res.status(401).json({ error: "Missing refresh token." });
    }

    const payload = verifyRefreshToken(refreshToken);

    if (payload.type !== "refresh" || !payload.sub || !payload.sid) {
      console.warn("auth refresh failed reason=invalidPayload");
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    const session = await get("SELECT * FROM auth_sessions WHERE id = ?", [payload.sid]);

    if (!session || session.userId !== payload.sub) {
      console.warn(`auth refresh failed reason=sessionNotFound sessionId=${payload.sid}`);
      return res.status(401).json({ error: "Refresh session not found." });
    }

    if (session.revokedAt) {
      console.warn(`auth refresh failed reason=sessionRevoked sessionId=${session.id}`);
      return res.status(401).json({ error: "Refresh session has been revoked." });
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      console.warn(`[AUTH] Token refresh failed: session expired. User must log in again.`);
      return res.status(401).json({ error: "Refresh session has expired." });
    }

    if (session.refreshTokenHash !== hashToken(refreshToken)) {
      console.warn(`auth refresh failed reason=tokenMismatch sessionId=${session.id}`);
      return res.status(401).json({ error: "Refresh token mismatch." });
    }

    const user = await get(
      "SELECT id, email, username, role, createdAt, updatedAt, lastLoginAt FROM users WHERE id = ?",
      [session.userId]
    );

    if (!user) {
      console.warn(`auth refresh failed reason=userNotFound userId=${session.userId}`);
      return res.status(401).json({ error: "User no longer exists." });
    }

    const newSession = await createSession(user, req);
    const now = new Date().toISOString();

    await run(
      "UPDATE auth_sessions SET revokedAt = ?, updatedAt = ? WHERE id = ?",
      [now, now, session.id]
    );

    setRefreshCookie(res, newSession.refreshToken);

    console.log(`[AUTH] Token refreshed successfully for ${user.username}`);

    return res.status(200).json({
      user: toPublicUser(user),
      accessToken: newSession.accessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Refresh token expired." });
    }

    return next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        if (payload?.sid) {
          const now = new Date().toISOString();
          await run(
            "UPDATE auth_sessions SET revokedAt = ?, updatedAt = ? WHERE id = ? AND revokedAt IS NULL",
            [now, now, payload.sid]
          );
        }
      } catch (error) {
        // Invalid or expired refresh tokens should still allow logout to succeed.
      }
    }

    clearRefreshCookie(res);
    console.log("auth logout success");
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.status(200).json({ user: req.user, accessTokenPayload: req.auth });
});

module.exports = router;