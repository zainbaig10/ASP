import { body, param, query, validationResult } from "express-validator";

// -----------------------------
// CREATE
// -----------------------------
export const validateCreateCategory = [
  body("name_en")
    .trim()
    .notEmpty()
    .withMessage("English name is required")
    .isLength({ min: 2 })
    .withMessage("Must be at least 2 characters"),

  body("name_ar")
    .optional()
    .isString()
    .withMessage("Arabic name must be string"),

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
  param("id").isMongoId().withMessage("Invalid category ID"),

  body("name_en")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Must be at least 2 characters"),

  body("name_ar")
    .optional()
    .isString(),

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
