import Category from "../schemas/categorySchema.js";

// -----------------------------
// CREATE CATEGORY
// -----------------------------
export const createCategory = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { name_en, name_ar } = req.body;

    const cleanName = name_en.trim();
    const slug = cleanName.toLowerCase().replace(/\s+/g, "-");

    // ✅ CHECK DUPLICATE MANUALLY
    const exists = await Category.findOne({ businessId, slug });

    if (exists) {
      return res.status(409).json({
        success: false,
        msg: "Category already exists",
      });
    }

    const category = await Category.create({
      businessId,
      name_en: cleanName,
      name_ar,
      slug,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
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

    const category = await Category.findOne({ _id: id, businessId });

    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }

    if (name_en !== undefined) {
      const cleanName = name_en.trim();
      const slug = cleanName.toLowerCase().replace(/\s+/g, "-");

      // ✅ DUPLICATE CHECK (excluding self)
      const exists = await Category.findOne({
        businessId,
        slug,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          msg: "Category already exists",
        });
      }

      category.name_en = cleanName;
      category.slug = slug;
    }

    if (name_ar !== undefined) {
      category.name_ar = name_ar;
    }

    await category.save();

    res.json({
      success: true,
      data: category,
    });
  } catch (err) {
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
