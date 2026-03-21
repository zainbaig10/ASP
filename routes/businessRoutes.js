import express from "express";

import {
  createBusiness,
  getBusinessProfile,
  updateBusiness,
} from "../controllers/businessController.js";

import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  validateCreateBusiness,
  validateUpdateBusiness,
} from "../validators/businessValidator.js";

const businessRouter = express.Router();

businessRouter
  .route("/create-business")
  .post(validateCreateBusiness, createBusiness);

businessRouter
  .route("/update-business")
  .patch(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateUpdateBusiness,
    updateBusiness,
  );

businessRouter
  .route("/get-business")
  .get(authenticateJWT, authorizeRoles("ADMIN"), getBusinessProfile);

export default businessRouter;
