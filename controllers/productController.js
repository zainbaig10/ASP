import Product from "../schemas/productSchema.js";

// -----------------------------
// CREATE PRODUCT
// -----------------------------
export const createProduct = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    let {
      name_en,
      name_ar,
      productCode,
      categoryId,
      description_en,
      description_ar,
      images,
      variants,
      badge,
    } = req.body;

    // Clean variants
    if (variants) {
      variants.sizes = variants.sizes
        ? [...new Set(variants.sizes.map((s) => s.trim()))]
        : [];

      variants.colors = variants.colors
        ? [...new Set(variants.colors.map((c) => c.trim()))]
        : [];

      variants.packSizes = variants.packSizes
        ? [...new Set(variants.packSizes.map((p) => p.trim()))]
        : [];
    }

    const product = await Product.create({
      businessId,
      name_en: name_en.trim(),
      name_ar,
      productCode,
      categoryId,
      description_en,
      description_ar,
      images,
      variants,
      badge,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "Product already exists",
      });
    }
    next(err);
  }
};

// -----------------------------
// GET ALL PRODUCTS
// -----------------------------
export const getProducts = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { status, categoryId, search } = req.query;

    const filter = { businessId };

    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;

    if (search) {
      filter.name_en = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter)
      .populate("categoryId", "name_en")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// GET SINGLE PRODUCT
// -----------------------------
export const getProductById = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      businessId,
    }).populate("categoryId", "name_en");

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// UPDATE PRODUCT
// -----------------------------
export const updateProduct = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    let update = { ...req.body };

    if (update.name_en) {
      update.name_en = update.name_en.trim();
    }

    // Clean variants
    if (update.variants) {
      update.variants.sizes = update.variants.sizes
        ? [...new Set(update.variants.sizes.map((s) => s.trim()))]
        : [];

      update.variants.colors = update.variants.colors
        ? [...new Set(update.variants.colors.map((c) => c.trim()))]
        : [];

      update.variants.packSizes = update.variants.packSizes
        ? [...new Set(update.variants.packSizes.map((p) => p.trim()))]
        : [];
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, businessId },
      update,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: "Duplicate product code",
      });
    }
    next(err);
  }
};

// -----------------------------
// TOGGLE STATUS
// -----------------------------
export const toggleProductStatus = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: id, businessId },
      { status },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// DELETE PRODUCT
// -----------------------------
export const deleteProduct = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    const product = await Product.findOneAndDelete({
      _id: id,
      businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    res.json({
      success: true,
      msg: "Product deleted",
    });
  } catch (err) {
    next(err);
  }
};
