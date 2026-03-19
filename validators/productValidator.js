import { body, param, validationResult } from "express-validator";

// -----------------------------
// CREATE PRODUCT
// -----------------------------
export const validateCreateProduct = [
  body("name_en")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Must be at least 2 characters"),

  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be array"),

  body("variants.sizes")
    .optional()
    .isArray()
    .withMessage("Sizes must be array"),

  body("variants.colors")
    .optional()
    .isArray()
    .withMessage("Colors must be array"),

  body("variants.packSizes")
    .optional()
    .isArray()
    .withMessage("Pack sizes must be array"),

  body("badge")
    .optional()
    .isIn(["NONE", "NEW", "OFFER", "FEATURED"])
    .withMessage("Invalid badge"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }
    next();
  },
];

// -----------------------------
// UPDATE PRODUCT
// -----------------------------
export const validateUpdateProduct = [
  param("id").isMongoId().withMessage("Invalid product ID"),

  body("name_en")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Must be at least 2 characters"),

  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }
    next();
  },
];

// -----------------------------
// STATUS
// -----------------------------
export const validateToggleProductStatus = [
  param("id").isMongoId().withMessage("Invalid product ID"),

  body("status")
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((e) => e.msg),
      });
    }
    next();
  },
];
