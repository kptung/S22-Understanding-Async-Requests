import Product from "../models/product.js";

const PLACEHOLDER_DETAILS = { cause: null, message: "Something went wrong..." };
const PRODUCTS_PER_PAGE = process.env.PRODUCTS_PER_PAGE || 3;

export const getProductsPage = async (req, res, next) => {
  const page = req.query.page;

  const { products, paginationData } = await Product.fetchAll(
    page,
    PRODUCTS_PER_PAGE,
    req.user._id
  );
  return res.render("admin/products", {
    products,
    pageTitle: "Admin Products",
    path: "/admin/products",
    paginationData,
  });
};

export const getAddProduct = (req, res, next) => {
  return res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

export const postAddProduct = async (req, res, next) => {
  const { title, description, price } = req.body;
  const imageUrl = req?.file.path;

  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await Product.addProduct({
      title,
      price,
      description,
      imageUrl,
      userId: req.user._id,
    });

  if (!didSucceed) {
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: [details],
    });
  }
  if (didSucceed) {
    req.flash("info", details);
    return res.redirect(`/products`);
  }
};

export const getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect("/");

  const id = req.params.productId;
  const {
    didSucceed,
    details = PLACEHOLDER_DETAILS,
    product = {},
  } = await Product.findProductById(id);

  if (!didSucceed) {
    req.flash("error", details);
    return res.redirect("/products");
  }
  if (didSucceed) {
    return res.render("admin/edit-product", {
      productId: id,
      oldInput: product,
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
    });
  }
};

export const postEditProduct = async (req, res, next) => {
  const id = req.body.productId;
  const existingImageUrl = req.body.existingImageUrl;

  const { title, price, description } = req.body;
  const imageUrl = req.file
    ? `images/${req.file.filename}`
    : req.body.existingImageUrl;

  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await Product.editProductById(
      id,
      title,
      price,
      description,
      imageUrl,
      existingImageUrl,
      req.user._id
    );

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/admin/products");
};

export const postDeleteProduct = async (req, res, next) => {
  const id = req.body.productId;
  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await Product.deleteProduct(id, req.user._id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/admin/products");
};

export default {
  getProductsPage,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
};
