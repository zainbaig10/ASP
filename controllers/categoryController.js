import Category from "../schemas/categorySchema.js";

// -----------------------------
// CREATE CATEGORY
// -----------------------------
export const createCategory = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { name_en, name_ar } = req.body;

    const slug = name_en.toLowerCase().replace(/\s+/g, "-");

    const category = await Category.create({
      businessId,
      name_en: name_en.trim(),
      name_ar,
      slug,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "Category already exists",
      });
    }
    next(err);
  }
};

// -----------------------------
// GET CATEGORIES
// -----------------------------
export const getCategories = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { status } = req.query;

    const filter = { businessId };

    if (status) {
      filter.status = status;
    }

    const categories = await Category.find(filter)
      .sort({ name_en: 1 })
      .lean();

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// UPDATE CATEGORY
// -----------------------------
export const updateCategory = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;
    const { name_en, name_ar } = req.body;

    const update = {};

    if (name_en !== undefined) {
      update.name_en = name_en.trim();
      update.slug = name_en.toLowerCase().replace(/\s+/g, "-");
    }

    if (name_ar !== undefined) {
      update.name_ar = name_ar;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No valid fields provided",
      });
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, businessId },
      update,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "Category already exists",
      });
    }
    next(err);
  }
};

// -----------------------------
// TOGGLE STATUS
// -----------------------------
export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, businessId },
      { status },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};
