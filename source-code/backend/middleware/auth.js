const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes – verifies JWT and attaches `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Expect: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

/**
 * Restrict to specific roles.
 * Usage: authorize("admin")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: `Role '${req.user.role}' is not authorized for this route`,
        });
    }
    next();
  };
};

module.exports = { protect, authorize };
