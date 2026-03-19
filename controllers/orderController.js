import Order from "../schemas/orderSchema.js";
import OrderItem from "../schemas/orderItemSchema.js";
import Product from "../schemas/productSchema.js";
import Category from "../schemas/categorySchema.js";
import Salesman from "../schemas/salesmanSchema.js";
import mongoose from "mongoose";

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { businessId } = req.user; // ✅ from JWT

    if (!businessId) {
      return res.status(400).json({
        success: false,
        msg: "Business context missing",
      });
    }

    const {
      salesmanId,
      customerName,
      companyName,
      email,
      phone,
      notes,
      items,
    } = req.body;

    const orderNumber = "ORD-" + Date.now();

    const [order] = await Order.create(
      [
        {
          businessId,
          orderNumber,
          salesmanId,
          customerName,
          companyName,
          email,
          phone,
          notes,
        },
      ],
      { session }
    );

    const orderItems = items.map((item) => ({
      orderId: order._id,
      productId: item.productId,
      quantity: item.quantity,
      variant: item.variant,
    }));

    await OrderItem.insertMany(orderItems, { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { status, salesmanId, search } = req.query;

    const filter = { businessId };

    if (status) filter.status = status;
    if (salesmanId) filter.salesmanId = salesmanId;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter)
      .populate("salesmanId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, businessId })
      .populate("salesmanId", "name phone email")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Order not found",
      });
    }

    const items = await OrderItem.find({ orderId: id })
      .populate("productId", "name_en images")
      .lean();

    res.json({
      success: true,
      data: {
        ...order,
        items,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: id, businessId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    const [products, categories, orders, salesmen] = await Promise.all([
      Product.countDocuments({ businessId }),
      Category.countDocuments({ businessId }),
      Order.countDocuments({ businessId }),
      Salesman.countDocuments({ businessId }),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts: products,
        totalCategories: categories,
        totalOrders: orders,
        totalSalesmen: salesmen,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    const orders = await Order.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("salesmanId", "name")
      .lean();

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const { businessId } = req.user;

    const [orders, products, salesmen] = await Promise.all([
      Order.find({ businessId }).sort({ createdAt: -1 }).limit(3),
      Product.find({ businessId }).sort({ createdAt: -1 }).limit(2),
      Salesman.find({ businessId }).sort({ createdAt: -1 }).limit(2),
    ]);

    const activities = [];

    orders.forEach((o) => {
      activities.push({
        message: `Order ${o.orderNumber} created`,
        time: o.createdAt,
      });
    });

    products.forEach((p) => {
      activities.push({
        message: `Product added: ${p.name_en}`,
        time: p.createdAt,
      });
    });

    salesmen.forEach((s) => {
      activities.push({
        message: `New salesman added: ${s.name}`,
        time: s.createdAt,
      });
    });

    // Sort all together
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: activities.slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (req, res) => {
  res.json({
    success: true,
    data: [
      { message: "New order received", type: "ORDER" },
      { message: "New product added", type: "PRODUCT" },
    ],
  });
};
