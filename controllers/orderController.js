import Order from "../schemas/orderSchema.js";
import OrderItem from "../schemas/orderItemSchema.js";
import Product from "../schemas/productSchema.js";
import Category from "../schemas/categorySchema.js";
import Salesman from "../schemas/salesmanSchema.js";
import { getNextOrderNumber } from "../utils/generateOrderNumber.js";
import { sendOrderNotification } from "../utils/whatsappService.js";
import mongoose from "mongoose";

// export const createOrder = async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { businessId } = req.user;

//     if (!businessId) {
//       return res.status(400).json({
//         success: false,
//         msg: "Business context missing",
//       });
//     }

//     const {
//       salesmanId,
//       customerName,
//       companyName,
//       email,
//       phone,
//       notes,
//       items,
//     } = req.body;

//     // -----------------------------
//     // FETCH PRODUCTS
//     // -----------------------------
//     const productIds = items.map((i) => i.productId);

//     const products = await Product.find({
//       _id: { $in: productIds },
//     })
//       .select("name_en")
//       .lean();

//     const productMap = {};
//     products.forEach((p) => {
//       productMap[p._id.toString()] = p;
//     });

//     // -----------------------------
//     // GENERATE ORDER NUMBER
//     // -----------------------------
//     const orderNumber = await getNextOrderNumber(businessId, session);

//     // -----------------------------
//     // CREATE ORDER
//     // -----------------------------
//     const [order] = await Order.create(
//       [
//         {
//           businessId,
//           orderNumber,
//           salesmanId,
//           customerName,
//           companyName,
//           email,
//           phone,
//           notes,
//         },
//       ],
//       { session }
//     );

//     // -----------------------------
//     // CREATE ORDER ITEMS
//     // -----------------------------
//     const orderItems = items.map((item) => ({
//       orderId: order._id,
//       productId: item.productId,
//       quantity: item.quantity,
//       variant: item.variant,
//     }));

//     await OrderItem.insertMany(orderItems, { session });

//     await session.commitTransaction();

//     // -----------------------------
//     // ENRICH RESPONSE
//     // -----------------------------
//     const enrichedItems = items.map((item) => {
//       const product = productMap[item.productId.toString()];

//       return {
//         productId: item.productId,
//         name: product?.name_en || "Product",
//         quantity: item.quantity,
//         variant: item.variant,
//       };
//     });

//     const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

//     // -----------------------------
//     // SEND WHATSAPP (ASYNC)
//     // -----------------------------
//     setImmediate(() => {
//       sendOrderNotification({
//         businessId,
//         orderNumber,
//         companyName,
//         phone,
//         items: enrichedItems,
//       });
//     });

//     // -----------------------------
//     // RESPONSE
//     // -----------------------------
//     res.status(201).json({
//       success: true,
//       data: {
//         orderId: order._id,
//         orderNumber,
//         customerName,
//         companyName,
//         phone,
//         totalItems,
//         itemCount: enrichedItems.length,
//         items: enrichedItems,
//         createdAt: order.createdAt,
//       },
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     next(err);
//   } finally {
//     session.endSession();
//   }
// };

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      businessId,
      salesmanId,
      customerName,
      companyName,
      email,
      phone,
      notes,
      items,
    } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        msg: "Business ID is required",
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        msg: "Order items are required",
      });
    }

    // -----------------------------
    // FETCH PRODUCTS
    // -----------------------------
    const productIds = items.map((i) => i.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    })
      .select("name_en")
      .lean();

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // -----------------------------
    // GENERATE ORDER NUMBER
    // -----------------------------
    const orderNumber = await getNextOrderNumber(businessId, session);

    // -----------------------------
    // CREATE ORDER
    // -----------------------------
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

    // -----------------------------
    // CREATE ORDER ITEMS
    // -----------------------------
    const orderItems = items.map((item) => ({
      orderId: order._id,
      productId: item.productId,
      quantity: item.quantity,
      variant: item.variant,
    }));

    await OrderItem.insertMany(orderItems, { session });

    await session.commitTransaction();

    // -----------------------------
    // ENRICH RESPONSE
    // -----------------------------
    const enrichedItems = items.map((item) => {
      const product = productMap[item.productId.toString()];

      return {
        productId: item.productId,
        name: product?.name_en || "Product",
        quantity: item.quantity,
        variant: item.variant,
      };
    });

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    // -----------------------------
    // SEND WHATSAPP (ASYNC)
    // -----------------------------
    setImmediate(() => {
      sendOrderNotification({
        businessId,
        orderNumber,
        companyName,
        phone,
        items: enrichedItems,
      });
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------
    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber,
        customerName,
        companyName,
        phone,
        totalItems,
        itemCount: enrichedItems.length,
        items: enrichedItems,
        createdAt: order.createdAt,
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
      .populate("productId", "name_en images productCode badge variants status") // ✅ FIXED
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
      { new: true },
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

    // -----------------------------
    // FETCH DATA (PARALLEL + OPTIMIZED)
    // -----------------------------
    const [orders, products, salesmen] = await Promise.all([
      Order.find({ businessId })
        .select("orderNumber companyName status createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Product.find({ businessId })
        .select("name_en createdAt")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),

      Salesman.find({ businessId })
        .select("name createdAt")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    const activities = [];

    // -----------------------------
    // ORDER CREATED
    // -----------------------------
    orders.forEach((o) => {
      activities.push({
        type: "ORDER_CREATED",
        message: `${o.companyName || "A customer"} placed an order (${o.orderNumber})`,
        time: o.createdAt,
      });
    });

    // -----------------------------
    // ORDER STATUS UPDATES
    // -----------------------------
    orders.forEach((o) => {
      if (o.status && o.status !== "NEW") {
        let message = "";

        switch (o.status) {
          case "QUOTATION_SENT":
            message = `Quotation sent for ${o.companyName || "customer"}`;
            break;

          case "CONFIRMED":
            message = `Order ${o.orderNumber} confirmed`;
            break;

          case "CANCELLED":
            message = `Order ${o.orderNumber} cancelled`;
            break;

          case "CONTACTED":
            message = `Customer contacted for ${o.orderNumber}`;
            break;

          default:
            message = `Order ${o.orderNumber} updated`;
        }

        activities.push({
          type: "ORDER_STATUS",
          message,
          time: o.updatedAt,
        });
      }
    });

    // -----------------------------
    // PRODUCT CREATED
    // -----------------------------
    products.forEach((p) => {
      activities.push({
        type: "PRODUCT_CREATED",
        message: `Product added: ${p.name_en}`,
        time: p.createdAt,
      });
    });

    // -----------------------------
    // SALESMAN CREATED
    // -----------------------------
    salesmen.forEach((s) => {
      activities.push({
        type: "SALESMAN_CREATED",
        message: `New salesman added: ${s.name}`,
        time: s.createdAt,
      });
    });

    // -----------------------------
    // FINAL SORT (ALL MIXED)
    // -----------------------------
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // -----------------------------
    // LIMIT FINAL OUTPUT
    // -----------------------------
    const finalActivities = activities.slice(0, 10);

    res.json({
      success: true,
      data: finalActivities,
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
