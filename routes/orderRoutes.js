import express from "express";

import { createOrder, getDashboardStats, getNotifications, getOrderDetails, getOrders, getRecentActivity, getRecentOrders, updateOrderStatus } from "../controllers/orderController.js";

import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import { validateCreateOrder } from "../validators/orderValidator.js";

const orderRouter = express.Router();

orderRouter
  .route("/create-order")
  .post(
    authenticateJWT,
    authorizeRoles("ADMIN"),
    validateCreateOrder,
    createOrder,
  );

orderRouter
  .route("/get-orders")
  .get(authenticateJWT, authorizeRoles("ADMIN"), getOrders);

orderRouter
  .route("/get-order-detail/:id")
  .get(authenticateJWT, authorizeRoles("ADMIN"), getOrderDetails);  

orderRouter
  .route("/update-order-status/:id")
  .put(authenticateJWT, authorizeRoles("ADMIN"), updateOrderStatus);  

orderRouter  
  .route("/get-dashboard-data").get(authenticateJWT, authorizeRoles("ADMIN"), getDashboardStats);

orderRouter
  .route("/get-recent-orders").get(authenticateJWT, authorizeRoles("ADMIN"), getRecentOrders);  

orderRouter
.route("/recent-activity").get(authenticateJWT, authorizeRoles("ADMIN"), getRecentActivity);

orderRouter
.route("/get-notifications").get(authenticateJWT, authorizeRoles("ADMIN"), getNotifications);

export default orderRouter;
