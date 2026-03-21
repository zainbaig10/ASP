import asynchandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../schemas/userSchema.js";
import { generateToken } from "../utils/jwtUtils.js";

export const initSuperAdmin = async (req, res) => {
  if (req.headers["x-init-key"] !== process.env.INIT_SUPER_ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      msg: "Forbidden",
    });
  }

  const { name, email, password } = req.body;

  const exists = await User.findOne({ role: "SUPER_ADMIN" });

  if (exists) {
    return res.status(400).json({
      success: false,
      msg: "Super admin already exists",
    });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "SUPER_ADMIN",
  });

  res.status(201).json({
    success: true,
    msg: "Super admin created",
    data: {
      id: user._id,
      email: user.email,
    },
  });
};

export const createAdmin = async (req, res) => {
  const { businessId, name, email, password } = req.body;

  const existing = await User.findOne({ businessId, email });

  if (existing) {
    return res.status(409).json({
      success: false,
      msg: "Admin already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    businessId,
    name,
    email,
    password: hashedPassword,
    role: "ADMIN",
  });

  res.status(201).json({
    success: true,
    msg: "Admin created successfully",
    data: {
      id: user._id,
      email: user.email,
    },
  });
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user || user.role !== "ADMIN") {
    return res.status(404).json({
      success: false,
      msg: "Admin not found",
    });
  }

  const { name, password, isActive } = req.body;

  if (name) user.name = name;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  await user.save();

  res.json({
    success: true,
    msg: "Admin updated successfully",
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate({
      path: "businessId",
      select: "name country email phone isActive",
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      businessId: user.businessId?._id.toString(),
    };

    const token = generateToken(tokenPayload);

    res.json({
      success: true,
      data: {
        token,
        role: user.role,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          business: user.businessId || null,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      msg: "User not found",
    });
  }

  const ok = await bcrypt.compare(currentPassword, user.password);

  if (!ok) {
    return res.status(400).json({
      success: false,
      msg: "Incorrect current password",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  res.json({
    success: true,
    msg: "Password updated",
  });
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .lean();

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
