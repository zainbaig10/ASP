import Business from "../schemas/businessSchema.js";
import User from "../schemas/userSchema.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import slugify from "slugify";

export const createBusiness = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { business, admin } = req.body;

    // -----------------------------
    // GENERATE SLUG
    // -----------------------------
    const slug = slugify(business.name, { lower: true, strict: true });

    const existing = await Business.findOne({ slug }).session(session);

    if (existing) {
      return res.status(409).json({
        success: false,
        msg: "Business with same name already exists",
      });
    }

    // -----------------------------
    // CREATE BUSINESS
    // -----------------------------
    const [newBusiness] = await Business.create(
      [
        {
          name: business.name,
          slug,
          whatsappNumbers: business.whatsappNumbers || [],
          logo: business.logo,
          email: business.email,
          phone: business.phone,
          address: business.address,
          country: business.country,
          currency: business.currency || "SAR",
          isActive: true,
        },
      ],
      { session }
    );

    // -----------------------------
    // CREATE ADMIN
    // -----------------------------
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
        slug: newBusiness.slug,
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
      whatsappNumbers,
    } = req.body;

    // -----------------------------
    // BASIC FIELDS
    // -----------------------------
    if (name !== undefined) {
      business.name = name.trim();

      // OPTIONAL: update slug
      business.slug = slugify(name, { lower: true, strict: true });
    }

    if (address !== undefined) business.address = address;

    if (phone !== undefined) business.phone = phone;

    if (currency !== undefined) business.currency = currency;

    if (isActive !== undefined) business.isActive = isActive;

    // -----------------------------
    // WHATSAPP NUMBERS
    // -----------------------------
    if (whatsappNumbers !== undefined) {
      business.whatsappNumbers = whatsappNumbers;
    }

    await business.save();

    res.json({
      success: true,
      msg: "Business updated successfully",
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

export const getBusinessProfile = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    const business = await Business.findById(businessId).lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "Business not found",
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};
