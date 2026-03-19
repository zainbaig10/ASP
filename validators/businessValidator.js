import { body, validationResult } from "express-validator";

export const validateCreateBusiness = [
  body("business.name")
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ min: 2 }),

  body("business.phone")
    .notEmpty()
    .withMessage("Business phone is required"),

  body("business.address")
    .notEmpty()
    .withMessage("Business address is required"),

  body("business.country")
    .notEmpty()
    .withMessage("Country is required")
    .isIn(["KSA", "INDIA"])
    .withMessage("Country must be KSA or INDIA"),

  body("business.currency")
    .optional()
    .isString()
    .withMessage("Invalid currency"),

  body("admin.name")
    .notEmpty()
    .withMessage("Admin name is required"),

  body("admin.email")
    .notEmpty()
    .withMessage("Admin email is required")
    .isEmail()
    .withMessage("Invalid admin email"),

  body("admin.password")
    .notEmpty()
    .withMessage("Admin password is required")
    .isLength({ min: 6 })
    .withMessage("Admin password must be at least 6 characters"),

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


export const validateUpdateBusiness = [

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Business name must be at least 2 characters"),

  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),

  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone cannot be empty"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),

  body("currency")
    .optional()
    .isString()
    .withMessage("Invalid currency"),

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
