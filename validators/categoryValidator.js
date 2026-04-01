import { body, param, query, validationResult } from "express-validator";

// -----------------------------
// CREATE
// -----------------------------
export const validateCreateCategory = [
  // -----------------------------
  // NAME (EN)
  // -----------------------------
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  // -----------------------------
  // NAME (AR)
  // -----------------------------
  body("nameAr")
    .optional()
    .isString()
    .withMessage("Arabic name must be a string"),

  // -----------------------------
  // IMAGE
  // -----------------------------
  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a string URL")
    .isLength({ max: 500 })
    .withMessage("Image URL too long"),

  // -----------------------------
  // FINAL HANDLER
  // -----------------------------
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
// UPDATE
// -----------------------------
export const validateUpdateCategory = [
  // -----------------------------
  // NAME (EN)
  // -----------------------------
  body("name_en")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  // -----------------------------
  // NAME (AR)
  // -----------------------------
  body("name_ar")
    .optional()
    .isString()
    .withMessage("Arabic name must be a string"),

  // -----------------------------
  // IMAGE
  // -----------------------------
  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a string URL")
    .isLength({ max: 500 })
    .withMessage("Image URL too long"),

  // -----------------------------
  // STATUS
  // -----------------------------
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status"),

  // -----------------------------
  // FINAL HANDLER
  // -----------------------------
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
export const validateToggleCategoryStatus = [
  param("id").isMongoId().withMessage("Invalid category ID"),

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
