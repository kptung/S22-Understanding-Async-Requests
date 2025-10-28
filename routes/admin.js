import express from "express";
const router = express.Router();

import isAuthed from "../middleware/isAuthed.js";
import * as adminController from "../controllers/admin.js";
import catchErrAsync from "../utils/catchErrAsync.js";
import {
  validateObjectId,
  validateAddProductForm,
  validateEditProductForm,
} from "../utils/validation.js";
import handleValidation from "../middleware/handleValidation.js";

// /admin/products => GET
router.get(
  "/products",
  isAuthed(),
  catchErrAsync(adminController.getProductsPage)
);

// /admin/add-product => GET
router.get(
  "/add-product",
  isAuthed(),
  catchErrAsync(adminController.getAddProduct)
);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuthed(),
  validateAddProductForm(),
  handleValidation("admin/add-product", {
    path: "/admin/add-product",
    pageTitle: "Add Product",
  }),
  catchErrAsync(adminController.postAddProduct)
);

router.get(
  "/edit-product/:productId",
  isAuthed(),
  validateObjectId("productId"),
  handleValidation("/admin/products", {
    redirect: true,
  }),
  catchErrAsync(adminController.getEditProduct)
);

router.post(
  "/edit-product",
  isAuthed(),
  validateEditProductForm("productId"),
  handleValidation("admin/edit-product", {
    path: "/admin/edit-product",
    pageTitle: "Edit Product",
    editing: true,
  }),
  catchErrAsync(adminController.postEditProduct)
);

router.post(
  "/delete/:productId",
  isAuthed(),
  validateObjectId("productId"),
  handleValidation("/admin/products", {
    redirect: true,
  }),
  catchErrAsync(adminController.postDeleteProduct)
);

export default router;
