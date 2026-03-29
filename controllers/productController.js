import Product from "../schemas/productSchema.js";
import Business from "../schemas/businessSchema.js";

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

    // -----------------------------
    // CHECK DUPLICATE PRODUCT CODE
    // -----------------------------
    if (productCode) {
      const exists = await Product.findOne({
        businessId,
        productCode,
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          msg: "Product code already exists",
        });
      }
    }

    // -----------------------------
    // CLEAN VARIANTS
    // -----------------------------
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

    const {
      status,
      categoryId,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { businessId };

    // -----------------------------
    // FILTERS
    // -----------------------------
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;

    // -----------------------------
    // 🔍 LIVE SEARCH (AUTOCOMPLETE)
    // -----------------------------
    if (search) {
      filter.name_en = {
        $regex: `^${search}`,
        $options: "i",
      };
    }

    // -----------------------------
    // PAGINATION
    // -----------------------------
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .select("name_en images categoryId variants status productCode badge") // ✅ FIXED
      .populate("categoryId", "name_en")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
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

    const {
      name_en,
      name_ar,
      productCode,
      categoryId,
      description_en,
      description_ar,
      images,
      variants,
      badge,
      status,
    } = req.body;

    // -----------------------------
    // FIND PRODUCT
    // -----------------------------
    const product = await Product.findOne({
      _id: id,
      businessId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    // -----------------------------
    // DUPLICATE PRODUCT CODE CHECK
    // -----------------------------
    if (productCode !== undefined) {
      const exists = await Product.findOne({
        businessId,
        productCode,
        _id: { $ne: id }, // exclude current product
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          msg: "Product code already exists",
        });
      }

      product.productCode = productCode;
    }

    // -----------------------------
    // SAFE FIELD UPDATES
    // -----------------------------
    if (name_en !== undefined) product.name_en = name_en.trim();
    if (name_ar !== undefined) product.name_ar = name_ar;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (description_en !== undefined) product.description_en = description_en;
    if (description_ar !== undefined) product.description_ar = description_ar;
    if (images !== undefined) product.images = images;
    if (badge !== undefined) product.badge = badge;
    if (status !== undefined) product.status = status;

    // -----------------------------
    // CLEAN VARIANTS
    // -----------------------------
    if (variants !== undefined) {
      product.variants = {
        sizes: variants.sizes
          ? [...new Set(variants.sizes.map((s) => s.trim()))]
          : [],
        colors: variants.colors
          ? [...new Set(variants.colors.map((c) => c.trim()))]
          : [],
        packSizes: variants.packSizes
          ? [...new Set(variants.packSizes.map((p) => p.trim()))]
          : [],
      };
    }

    await product.save();

    res.json({
      success: true,
      msg: "Product updated successfully",
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

export const getPublicProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const {
      categoryId,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // -----------------------------
    // FIND BUSINESS
    // -----------------------------
    const business = await Business.findOne({ slug }).lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "Business not found",
      });
    }

    const filter = {
      businessId: business._id,
      status: "ACTIVE", // only active products for website
    };

    // -----------------------------
    // FILTERS
    // -----------------------------
    if (categoryId) filter.categoryId = categoryId;

    // -----------------------------
    // 🔍 LIVE SEARCH (AUTOCOMPLETE)
    // -----------------------------
    if (search) {
      filter.name_en = {
        $regex: `^${search}`,
        $options: "i",
      };
    }

    // -----------------------------
    // PAGINATION
    // -----------------------------
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .select("name_en name_ar images categoryId variants badge")
      .populate("categoryId", "name_en")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      status: "ACTIVE", // ✅ only public/active products
    })
      .populate("categoryId", "name_en")
      .lean();

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