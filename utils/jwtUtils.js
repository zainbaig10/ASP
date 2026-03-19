import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      businessId: payload.businessId || null,
      isSuperAdmin: payload.isSuperAdmin || false,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid token");
  }
};
