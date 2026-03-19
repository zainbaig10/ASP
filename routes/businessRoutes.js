import express from "express";

import {
  createBusiness,
  updateBusiness,
} from "../controllers/businessController.js";


import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import { validateCreateBusiness, validateUpdateBusiness } from "../validators/businessValidator.js";

const businessRouter = express.Router();

businessRouter
  .route("/create-business")
  .post(
    validateCreateBusiness,
    createBusiness,
  );

businessRouter
  .route("/update-business")
  .patch(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateUpdateBusiness,
    updateBusiness,
  );

export default businessRouter;
