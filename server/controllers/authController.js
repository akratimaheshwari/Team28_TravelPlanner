// server/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set in .env");
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}
function signRefreshToken(user) {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error("JWT_REFRESH_SECRET not set in .env");
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    // If Mongoose validation or duplicate key, give more helpful response
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res.status(400).json({ message: "Duplicate field value", detail: err.keyValue });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", detail: err.errors });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // comparePassword should be defined on user schema
    if (typeof user.comparePassword !== "function")
      throw new Error("User.comparePassword is not defined on model");

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ message: "No token" });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    const accessToken = signAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
