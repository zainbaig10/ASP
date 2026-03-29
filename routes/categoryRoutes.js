import express from "express";

import {
  createCategory,
  getCategories,
  getPublicCategories,
  toggleCategoryStatus,
  updateCategory,
} from "../controllers/categoryController.js";

import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  validateToggleCategoryStatus
} from "../validators/categoryValidator.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/create-category")
  .post(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    createCategory,
  );

categoryRouter
  .route("/update-category/:id")
  .put(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    updateCategory,
  );

categoryRouter
  .route("/get-category")
  .get(authenticateJWT, authorizeRoles("ADMIN"),getCategories);

categoryRouter
  .route("/toggle-category/:id/status")
  .patch(authenticateJWT, authorizeRoles("ADMIN"), validateToggleCategoryStatus, toggleCategoryStatus);

categoryRouter.route("/getPublicCategory").get(getPublicCategories);

export default categoryRouter;
