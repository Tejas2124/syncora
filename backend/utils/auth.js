const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const isProduction = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || (!isProduction ? crypto.randomBytes(32).toString("hex") : null);
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || (!isProduction ? crypto.randomBytes(32).toString("hex") : null);
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Missing JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your environment before starting the server."
  );
}

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  if (!isProduction) {
    console.warn(
      "JWT secrets are not set; generated ephemeral dev secrets for this process. Configure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET for stable sessions."
    );
  }
}

const REFRESH_COOKIE_NAME = "moodread_refresh_token";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username || "").trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_.-]{3,30}$/.test(username);
}

function validatePassword(password) {
  const errors = [];

  if (typeof password !== "string") {
    errors.push("Password is required.");
    return errors;
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must include at least one number.");
  }

  if (!/[!@#$%^&*(),.?":{}|<>\-_[\]\\/`~';+=]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }

  return errors;
}

function validateRegisterPayload(payload = {}) {
  const errors = [];
  const email = normalizeEmail(payload.email);
  const username = normalizeUsername(payload.username);
  const password = typeof payload.password === "string" ? payload.password : "";
  const confirmPassword = typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

  if (!email) {
    errors.push("Email is required.");
  } else if (!validateEmail(email)) {
    errors.push("Email format is invalid.");
  }

  if (!username) {
    errors.push("Username is required.");
  } else if (!validateUsername(username)) {
    errors.push("Username must be 3-30 characters and can only use letters, numbers, dot, underscore, or hyphen.");
  }

  errors.push(...validatePassword(password));

  if (!confirmPassword) {
    errors.push("Confirm password is required.");
  } else if (password && password !== confirmPassword) {
    errors.push("Password and confirm password do not match.");
  }

  return {
    valid: errors.length === 0,
    errors,
    values: {
      email,
      username,
      password,
    },
  };
}

function validateLoginPayload(payload = {}) {
  const identifier = String(payload.identifier || payload.email || payload.username || "").trim();
  const password = typeof payload.password === "string" ? payload.password : "";
  const errors = [];

  if (!identifier) {
    errors.push("Email or username is required.");
  }

  if (!password) {
    errors.push("Password is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
    values: {
      identifier,
      password,
    },
  };
}

function createAccessToken(user, sessionId) {
  return jwt.sign(
    {
      sub: user.id,
      sid: sessionId,
      type: "access",
      email: user.email,
      username: user.username,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function createRefreshToken(user, sessionId) {
  return jwt.sign(
    {
      sub: user.id,
      sid: sessionId,
      type: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt || null,
  };
}

module.exports = {
  ACCESS_TOKEN_TTL,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL,
  createAccessToken,
  createRefreshToken,
  extractBearerToken,
  getRefreshCookieOptions,
  hashToken,
  normalizeEmail,
  normalizeUsername,
  toPublicUser,
  validateEmail,
  validateLoginPayload,
  validatePassword,
  validateRegisterPayload,
  verifyAccessToken,
  verifyRefreshToken,
};