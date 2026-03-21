import express from "express";

import {validateChangePassword, validateCreateAdmin, validateInitSuperAdmin, validateLogin, validateUpdateAdmin } from "../validators/authValidator.js";

import {
  initSuperAdmin,
  createAdmin,
  updateAdmin,
  login,
  changePassword,
  getAdminProfile,
} from "../controllers/authController.js";

import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.route("/init-super-admin").post(validateInitSuperAdmin, initSuperAdmin);

authRouter
  .route("/create-admin")
  .post(authenticateJWT, validateCreateAdmin, authorizeRoles("SUPER_ADMIN"), createAdmin);

authRouter
  .route("/update-admin/:id")
  .put(authenticateJWT, validateUpdateAdmin, authorizeRoles("ADMIN"), updateAdmin);

authRouter.route("/login").post(validateLogin, login);

authRouter.route("/change-password").post(validateChangePassword, authenticateJWT, changePassword);

authRouter.route("/get-admin").get(authenticateJWT, authorizeRoles("ADMIN"), getAdminProfile);

export default authRouter;
