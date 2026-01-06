const jwt = require("jsonwebtoken");

// =====================
// Authenticate Middleware
// =====================
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    // ✅ Attach user info including base_id
    // decoded contains { id, role, base_id }
    req.user = {
      id: decoded.id,
      role: decoded.role,
      base_id: decoded.base_id || null // ensures base_id is always available
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// =====================
// Authorize Middleware
// =====================
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userRole = req.user.role;

    // Flatten array if needed
    if (Array.isArray(allowedRoles[0])) allowedRoles = allowedRoles[0];

    const normalizedRole = userRole.toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(normalizedRole)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
}

module.exports = { authenticate, authorize };





