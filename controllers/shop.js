import PDFDocument from "pdfkit-table";

import { fillInvoicePDF } from "../utils/index.js";
import Product from "../models/product.js";

const PLACEHOLDER_DETAILS = { cause: null, message: "Something went wrong..." };
const PRODUCTS_PER_PAGE = process.env.PRODUCTS_PER_PAGE || 3;

export async function getIndex(req, res, next) {
  const page = req.query.page;

  const { products, paginationData } = await Product.fetchAll(
    page,
    PRODUCTS_PER_PAGE
  );
  return res.render("shop/index", {
    products,
    pageTitle: "Shop",
    path: "/",
    paginationData,
  });
}

export async function getProductsPage(req, res, next) {
  const page = req.query.page;

  const { products, paginationData } = await Product.fetchAll(
    page,
    PRODUCTS_PER_PAGE
  );
  return res.render("shop/product-list", {
    products,
    pageTitle: "All Products",
    path: "/products",
    paginationData,
  });
}

export async function getProduct(req, res, next) {
  const id = req.params.id;
  const { didSucceed, details, product } = await Product.findProductById(id);

  if (!didSucceed) {
    req.flash("error", details);
    return res.redirect("/products");
  }
  if (didSucceed) {
    return res.render("shop/product-detail", {
      product,
      pageTitle: `${product.title} Details`,
      path: "/products",
    });
  }
}

export async function getCart(req, res, next) {
  const { details, cartItems } = await req.user.getCart();

  return res.render("shop/cart", {
    products: cartItems,
    path: "/cart",
    pageTitle: "Your Cart",
    infoMessage: details && details,
  });
}

export async function postCart(req, res, next) {
  const id = req.body.productId;
  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.addToCart(id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/products");
}

export async function postDeleteCart(req, res, next) {
  const id = req.body.productId;

  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.deleteItemFromCart(id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/cart");
}

export async function getOrders(req, res, next) {
  const orders = await req.user.getOrders();
  return res.render("shop/orders", {
    orders,
    path: "/orders",
    pageTitle: "Your Orders",
  });
}

export async function postOrder(req, res, next) {
  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.addOrder();

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/products");
}

export async function getInvoice(req, res, next) {
  const orderId = req.params.orderId;
  const {
    didSucceed,
    details = PLACEHOLDER_DETAILS,
    invoice,
  } = await req.user.getInvoice(orderId, req.user._id);

  if (!didSucceed) {
    req.flash("error", details);
    return res.redirect("/products");
  }
  if (didSucceed) {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${invoice.invoiceName}`
    );

    doc.pipe(res);
    await fillInvoicePDF(doc, invoice);
    doc.end();

    doc.on("error", (err) => {
      log(
        "error",
        `Stream error for invoice PDF "${invoiceName}": ${err.message}`
      );
      if (!res.headersSent) {
        log("error", `Error streaming invoice PDF: ${err.message}`);
        res.status(500).send(`Error streaming invoice PDF: ${err.message}`);
      }
    });
  }
}

export default {
  getIndex,
  getProductsPage,
  getProduct,
  getCart,
  postCart,
  postDeleteCart,
  getOrders,
  postOrder,
  getInvoice,
};
