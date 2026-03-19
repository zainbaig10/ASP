import { body, param, validationResult } from "express-validator";

export const validateCreateSalesman = [
  body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required"),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be string"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email"),

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

export const validateUpdateSalesman = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email"),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be string"),

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

export const validateToggleSalesmanStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
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
