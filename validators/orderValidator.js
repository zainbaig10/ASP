import { body, param, validationResult } from "express-validator";

export const validateCreateOrder = [
  body("companyName")
    .notEmpty()
    .withMessage("Company name is required"),

  body("customerName")
    .optional()
    .isString(),

  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  body("items.*.productId")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("items.*.quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be number"),

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
