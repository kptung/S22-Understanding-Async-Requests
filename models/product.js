import mongoose from "mongoose";
import { newError, createLogger, removeFile } from "../utils/index.js";

const { Schema } = mongoose;
const log = createLogger(import.meta.url);

const productSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

productSchema.statics.fetchAll = async function (
  page,
  PRODUCTS_PER_PAGE,
  filter
) {
  if (isNaN(page) || page === undefined) page = 1;
  page = +page;

  try {
    const totalProductsCount = await this.estimatedDocumentCount();
    log(
      "info",
      `Currently on page ${page}, fetching max ${PRODUCTS_PER_PAGE} products, total products count: ${totalProductsCount}`
    );

    const products = await this.find(filter ? { userId: filter } : {})
      .skip((page - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE);
    // log("info", `Products fetched: ${products}`); // DEBUGGING

    return {
      products,
      paginationData: {
        currentPage: page,
        hasNextPage: PRODUCTS_PER_PAGE * page < totalProductsCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE),
      },
    };
  } catch (error) {
    log("error", error);
    throw newError("Failed to fetch products", error);
  }
};

productSchema.statics.findProductById = async function (id) {
  try {
    const product = await this.findById(id);

    if (!product) {
      log("warn", `Product with ID ${id} not found`);
      return {
        didSucceed: false,
        details: { message: "Product not found!" },
      };
    }

    return { didSucceed: true, details: {}, product };
  } catch (error) {
    log("error", error);
    throw newError(`Failed to fetch product with ID: ${id}`, error);
  }
};

productSchema.statics.editProductById = async function (
  id,
  title,
  price,
  description,
  imageUrl,
  existingImageUrl,
  userId
) {
  try {
    userId = userId.toString();
    const updatedProduct = await this.updateOne(
      { _id: id, userId },
      { title, price, description, imageUrl },
      { new: true, runValidations: true }
    );

    if (updatedProduct.matchedCount === 0) {
      log("warn", `Product not updated - no ID match (${id})`);
      return {
        didSucceed: false,
        details: {
          message: "Product not found or you don't have permission to edit it",
        },
      };
    }

    if (updatedProduct.modifiedCount === 0) {
      log("info", "No changes made in product data");
      return {
        didSucceed: true,
        details: {
          message: "No changes detected in the product data",
        },
      };
    }

    // ^ if image was edited (if product imageUrl was changed), remove previous image file from '/images'
    if (imageUrl !== existingImageUrl) {
      log("info", `Removed image '${imageUrl}' from '/images'`);
      removeFile(existingImageUrl);
    }

    log("success", "Product updated");
    return {
      didSucceed: true,
      details: {
        message: "Product updated!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError(`Failed update product with ID: ${id}`, error);
  }
};

productSchema.statics.addProduct = async function (productData) {
  try {
    const product = await this.create(productData);

    if (!product) {
      log("error", "Adding product failed");
      return {
        didSucceed: false,
        details: {
          message: "Creating new product failed. Please try again later",
        },
      };
    }

    log("success", "Product created");
    return {
      didSucceed: true,
      details: {
        message: "Product created!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError("Failed to add new product", error);
  }
};

productSchema.statics.deleteProduct = async function (id, userId) {
  try {
    userId = userId.toString();
    const product = await this.findById(id);
    const deletedProduct = await this.deleteOne({ _id: id, userId });

    if (deletedProduct.deletedCount === 0) {
      log("warn", "Deleting product failed - invalid ID or userId");
      return {
        didSucceed: false,
        details: {
          message: "Deleting product failed. Please try again later",
        },
      };
    }

    log("info", `Removed image '${product.imageUrl}' from '/images'`);
    removeFile(product.imageUrl);

    log("success", "Product deleted");
    return {
      didSucceed: true,
      details: {
        message: "Product deleted!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError(`Failed to delete product with ID: ${id}`, error);
  }
};

export default mongoose.model("Product", productSchema);
