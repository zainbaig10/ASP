import expressRouter from "express";
import authRouter from "./authRoutes.js";
import businessRouter from "./businessRoutes.js";
import categoryRouter from "./categoryRoutes.js";
import productRouter from "./productRoutes.js";
import orderRouter from "./orderRoutes.js";
import salesmanRouter from "./salesmanRoutes.js";


const router = expressRouter();

router.use("/auth", authRouter);
router.use("/business", businessRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);
router.use("/salesman", salesmanRouter);


export default router;