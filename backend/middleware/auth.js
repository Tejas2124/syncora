const { get } = require("../db/db");
const { extractBearerToken, verifyAccessToken, toPublicUser } = require("../utils/auth");

async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: "Missing access token." });
    }

    const payload = verifyAccessToken(token);

    if (payload.type !== "access" || !payload.sub) {
      return res.status(401).json({ error: "Invalid access token." });
    }

    const user = await get(
      "SELECT id, email, username, role, createdAt, updatedAt, lastLoginAt FROM users WHERE id = ?",
      [payload.sub]
    );

    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.auth = payload;
    req.user = toPublicUser(user);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired." });
    }

    return res.status(401).json({ error: "Invalid access token." });
  }
}

module.exports = { requireAuth };