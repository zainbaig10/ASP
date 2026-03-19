import { verifyToken } from "../utils/jwtUtils.js";

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      msg: "Authorization token missing",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Normalize businessId
    if (decoded.businessId && typeof decoded.businessId === "object") {
      decoded.businessId =
        decoded.businessId._id || decoded.businessId.id;
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT ERROR:", err);

    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token",
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        msg: "Access denied",
      });
    }
    next();
  };
};
