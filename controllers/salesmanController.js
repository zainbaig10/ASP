import Salesman from "../schemas/salesmanSchema.js";
import Business from "../schemas/businessSchema.js";

export const createSalesman = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { name, phone, email } = req.body;

    // ✅ DUPLICATE EMAIL CHECK
    if (email) {
      const exists = await Salesman.findOne({ businessId, email });

      if (exists) {
        return res.status(409).json({
          success: false,
          msg: "Salesman with this email already exists",
        });
      }
    }

    const salesman = await Salesman.create({
      businessId,
      name: name.trim(),
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      data: salesman,
    });
  } catch (err) {
    next(err);
  }
};

export const getSalesmen = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    const salesmen = await Salesman.find({
      businessId,
    }).lean();

    res.json({
      success: true,
      data: salesmen,
    });
  } catch (err) {
    next(err);
  }
};



export const updateSalesman = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    const { name, phone, email } = req.body;

    const salesman = await Salesman.findOne({
      _id: id,
      businessId,
    });

    if (!salesman) {
      return res.status(404).json({
        success: false,
        msg: "Salesman not found",
      });
    }

    // ✅ EMAIL DUPLICATE CHECK
    if (email) {
      const exists = await Salesman.findOne({
        businessId,
        email,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          msg: "Email already used",
        });
      }
    }

    if (name !== undefined) salesman.name = name.trim();
    if (phone !== undefined) salesman.phone = phone;
    if (email !== undefined) salesman.email = email;

    await salesman.save();

    res.json({
      success: true,
      msg: "Salesman updated successfully",
      data: salesman,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleSalesmanStatus = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const salesman = await Salesman.findOneAndUpdate(
      { _id: id, businessId },
      { status },
      { new: true }
    );

    if (!salesman) {
      return res.status(404).json({
        success: false,
        msg: "Salesman not found",
      });
    }

    res.json({
      success: true,
      msg: "Salesman status updated",
      data: salesman,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicSalesmen = async (req, res, next) => {
  try {
    // Example: fetch the business (adjust logic as per your app)
    const business = await Business.findOne({}); // or by domain/email/etc.

    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "Business not found",
      });
    }

    const salesmen = await Salesman.find({
      businessId: business._id,
      status: "ACTIVE",
    }).lean();

    res.json({
      success: true,
      data: salesmen,
    });
  } catch (err) {
    next(err);
  }
};
