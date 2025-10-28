import express from "express";
const router = express.Router();

import isAuthed from "../middleware/isAuthed.js";
import shopController from "../controllers/shop.js";
import catchErrAsync from "../utils/catchErrAsync.js";
import { validateObjectId } from "../utils/validation.js";
import handleValidation from "../middleware/handleValidation.js";

router.get("/", catchErrAsync(shopController.getIndex));

router.get("/products", catchErrAsync(shopController.getProductsPage));

router.get(
  "/products/:id",
  validateObjectId("id"),
  handleValidation("/products", {
    redirect: true,
  }),
  catchErrAsync(shopController.getProduct)
);

router.get("/cart", isAuthed(), catchErrAsync(shopController.getCart));

router.post(
  "/cart",
  isAuthed(),
  validateObjectId("productId"),
  handleValidation("/products", {
    redirect: true,
  }),
  catchErrAsync(shopController.postCart)
);

router.post(
  "/cart/delete/:productId",
  isAuthed(),
  validateObjectId("productId"),
  handleValidation("/cart", {
    redirect: true,
  }),
  catchErrAsync(shopController.postDeleteCart)
);

router.get("/orders", isAuthed(), catchErrAsync(shopController.getOrders));

router.post(
  "/orders/create",
  isAuthed(),
  catchErrAsync(shopController.postOrder)
);

router.get(
  "/orders/:orderId",
  isAuthed(),
  validateObjectId("orderId"),
  handleValidation("/orders", { redirect: true }),
  catchErrAsync(shopController.getInvoice)
);

export default router;
