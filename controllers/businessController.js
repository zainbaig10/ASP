import Business from "../schemas/businessSchema.js";
import User from "../schemas/userSchema.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const createBusiness = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { business, admin } = req.body;

    const [newBusiness] = await Business.create(
      [
        {
          name: business.name,
          logo: business.logo,
          email: business.email,
          phone: business.phone,
          address: business.address,
          country: business.country,
          currency: business.currency || "USD",
          isActive: true,
        },
      ],
      { session }
    );

    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const [adminUser] = await User.create(
      [
        {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: "ADMIN",
          businessId: newBusiness._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      msg: "Business created successfully",
      data: {
        businessId: newBusiness._id,
        adminId: adminUser._id,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const updateBusiness = async (req, res) => {
  try {

    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized",
      });
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "Business not found",
      });
    }

    const {
      name,
      address,
      phone,
      currency,
      isActive,
    } = req.body;

    // -----------------------------
    // BASIC FIELDS
    // -----------------------------

    if (name !== undefined) business.name = name.trim();

    if (address !== undefined) business.address = address;

    if (phone !== undefined) business.phone = phone;

    if (currency !== undefined) business.currency = currency;

    if (isActive !== undefined) business.isActive = isActive;

    await business.save();

    res.json({
      success: true,
      data: business,
    });

  } catch (err) {

    console.error("Update business error:", err);

    res.status(500).json({
      success: false,
      msg: err.message,
    });

  }
};
