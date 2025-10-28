import express from "express";
const router = express.Router();

import adminRoutes from "./admin.js";
import shopRoutes from "./shop.js";
import authRoutes from "./auth.js";

router.use("/admin", adminRoutes);
router.use(shopRoutes);
router.use(authRoutes);

export default router;
