import express from "express";

import {
  createProduct,
  getProductById,
  getProducts,
  getPublicProducts,
  toggleProductStatus,
  updateProduct,
} from "../controllers/productController.js";

import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  validateCreateProduct,
  validateToggleProductStatus,
  validateUpdateProduct,
} from "../validators/productValidator.js";

const productRouter = express.Router();

productRouter
  .route("/create-product")
  .post(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateCreateProduct,
    createProduct,
  );

productRouter
  .route("/update-product/:id")
  .put(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateUpdateProduct,
    updateProduct,
  );

productRouter
  .route("/get-products")
  .get(authenticateJWT, authorizeRoles("ADMIN"), getProducts);

productRouter
  .route("/get-productById/:id")
  .get(authenticateJWT, authorizeRoles("ADMIN"), getProductById);

productRouter
  .route("/toggle-product/:id/status")
  .patch(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateToggleProductStatus,
    toggleProductStatus,
  );
productRouter.route("/getPublicProducts").get(getPublicProducts);
export default productRouter;
