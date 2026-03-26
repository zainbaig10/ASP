import express from "express";

import {
  createCategory,
  getCategories,
  toggleCategoryStatus,
  updateCategory,
} from "../controllers/categoryController.js";

import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  validateCreateCategory,
  validateUpdateCategory,
  validateToggleCategoryStatus
} from "../validators/categoryValidator.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/create-category")
  .post(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateCreateCategory,
    createCategory,
  );

categoryRouter
  .route("/update-category/:id")
  .put(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateUpdateCategory,
    updateCategory,
  );

categoryRouter
  .route("/get-category")
  .get(authenticateJWT, getCategories);

categoryRouter
  .route("/toggle-category/:id/status")
  .patch(authenticateJWT, authorizeRoles("ADMIN"), validateToggleCategoryStatus, toggleCategoryStatus);



export default categoryRouter;
