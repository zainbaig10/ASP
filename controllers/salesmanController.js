import Salesman from "../schemas/salesmanSchema.js";

export const createSalesman = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { name, phone, email } = req.body;

    const salesman = await Salesman.create({
      businessId,
      name,
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


export const updateSalesman = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    const { name, phone, email } = req.body;

    const salesman = await Salesman.findOne({
      _id: id,
      businessId,
    });

    if (!Salesman) {
      return res.status(404).json({
        success: false,
        msg: "Salesman not found",
      });
    }

    // -----------------------------
    // ALLOWED UPDATES
    // -----------------------------
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

