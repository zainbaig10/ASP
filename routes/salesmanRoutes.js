import express from "express";

import { createSalesman, getPublicSalesmen, getSalesmen, toggleSalesmanStatus, updateSalesman } from "../controllers/salesmanController.js";

import {
    authenticateJWT,
    authorizeRoles,
} from "../middleware/authMiddleware.js";

import { validateCreateSalesman, validateToggleSalesmanStatus, validateUpdateSalesman } from "../validators/salesmanValidator.js";

const salesmanRouter = express.Router();

salesmanRouter
  .route("/create-salesman")
  .post(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateCreateSalesman,
    createSalesman,
  );

salesmanRouter
  .route("/get-all-salesmen")
  .get(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    getSalesmen,
  );

salesmanRouter
  .route("/update-salesman/:id")
  .put(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateUpdateSalesman,
    updateSalesman
  );  
 
salesmanRouter
  .route("/toggle-salesman-status/:id")
  .put(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateToggleSalesmanStatus,
    toggleSalesmanStatus
  );

salesmanRouter.route("/getPublicSalesmen").get(getPublicSalesmen)  

export default salesmanRouter;
