import mongoose from "mongoose";
import { newError, createLogger } from "../utils/index.js";

import Order from "./order.js";
import Product from "./product.js";

const { Schema } = mongoose;
const log = createLogger(import.meta.url);

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: {
    token: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// NOTE: This logic could be optimized using built-in Mongoose methods
// (e.g. $in queries). For now I’m keeping it simple and explicit,
// since I haven’t done a deep-dive into MongoDB yet - for now I'm focusing on the current NodeJS course
// MongoDB course coming soon :) - as mentioned in my GitHub profile README
userSchema.methods.getCart = async function () {
  try {
    // * handles situations where user added a product to cart and it was deleted from DB in the meantime
    // ^ stores an array of deleted products (ID) in users cart
    const deletedItemsInCart = (
      await Promise.all(
        this.cart.items.map(async (cartItem) => {
          // console.log(cartItem.productId); // DEBUGGING
          const product = await Product.findById(cartItem.productId);
          if (!product) return cartItem.productId;
          return null;
        })
      )
    ).filter(Boolean);

    let warningDetails;
    if (deletedItemsInCart.length > 0) {
      log(
        "warn",
        `Items found in cart that are no longer available (were deleted): ${deletedItemsInCart}`
      ); // DEBUGGING

      // ^ filters deleted items from this.cart.items based on 'deletedItemsInCart'
      const updatedCart = this.cart.items.filter(
        (cartItem) => !deletedItemsInCart.includes(cartItem.productId)
      );
      log("info", "Cart successfuly filtered from products no longer existing in DB"); // DEBUGGING

      this.cart.items = updatedCart;
      await this.save();

      warningDetails = [
        {
          message: `Some items were removed from your cart automatically, because they're no longer available`,
        },
      ];
    }

    const userData = await this.populate("cart.items.productId");
    // log("info", userData.cart.items); // DEBUGGING

    return { details: warningDetails, cartItems: userData.cart.items };
  } catch (error) {
    log("error", error);
    throw newError("Failed to get cart data", error);
  }
};

userSchema.methods.addToCart = async function (productId, productData) {
  try {
    // * check if product exists in DB (if it was deleted / productId tampering attempt)
    const {
      didSucceed,
      details,
      product: productData,
    } = await Product.findProductById(productId);

    if (!didSucceed) {
      log("warn", `Product not added to cart - ${details.message}`);
      return { didSucceed, details };
    }

    // ! conversion to string is needed, comparing two 'ObjectId' objects won't work
    const existingProductIndex = this.cart.items.findIndex((prod) => {
      return prod.productId.toString() === productData._id.toString();
    });

    let updatedCart;

    // ^ if cart product already exists, increase quantity
    if (existingProductIndex !== -1) {
      updatedCart = { items: [...this.cart.items] };
      updatedCart.items[existingProductIndex].quantity += 1;
    } else {
      updatedCart = {
        items: [
          ...this.cart.items,
          { productId: productData._id, quantity: 1 },
        ],
      };
    }
    // console.log("Updated Cart:", updatedCart); // DEBUGGING

    this.cart = updatedCart;
    await this.save();

    log("success", "Product added to cart");
    return { didSucceed: true, details: { message: "Product added to cart!" } };
  } catch (error) {
    log("error", error);
    throw newError("Failed to add item to cart", error);
  }
};

userSchema.methods.deleteItemFromCart = async function (productId) {
  try {
    const updatedCartItems = this.cart.items.filter((cartItem) => {
      return cartItem.productId.toString() !== productId.toString();
    });
    // console.log("Updated cart items:", updatedCartItems); // DEBUGGING

    // * check if product was NOT deleted from cart (due to an error / productId tampering attempt)
    if (updatedCartItems.length === this.cart.items.length) {
      log("warn", "Product deletion from cart failed");
      return {
        didSucceed: false,
        details: {
          message: "Item not found in cart or already removed",
        },
      };
    }

    this.cart.items = updatedCartItems;
    this.save();

    log("success", "Product deleted from cart");
    return {
      didSucceed: true,
      details: { message: "Product deleted from cart" },
    };
  } catch (error) {
    log("error", error);
    throw newError("Failed to delete product from cart", error);
  }
};

userSchema.methods.clearCart = async function () {
  try {
    this.cart = { items: [] };

    log("info", "Cart cleared");
    return await this.save();
  } catch (error) {
    log("error", error);
    throw newError("Failed to clear cart", error);
  }
};

userSchema.methods.getOrders = async function () {
  try {
    const orders = await Order.find({ "user.userId": this._id });
    return orders;
  } catch (error) {
    log("error", error);
    throw newError("Failed to find orders", error);
  }
};

userSchema.methods.addOrder = async function () {
  try {
    const userData = await this.populate("cart.items.productId");
    const products = userData.cart.items.map((item) => {
      return {
        productData: {
          title: item.productId.title,
          price: item.productId.price,
          description: item.productId.description,
          imageUrl: item.productId.imageUrl,
        },
        quantity: item.quantity,
      };
    });
    const order = new Order({
      user: {
        email: this.email,
        userId: this._id,
      },
      products,
    });

    await order.save();
    await this.clearCart();

    log("success", "Order created");
    return { didSucceed: true, details: { message: "Order created!" } };
  } catch (error) {
    log("error", error);
    return {
      didSucceed: false,
      details: { message: `Failed to create new order: ${error}` },
    };
  }
};

userSchema.methods.getInvoice = async function (orderId, sessionUserId) {
  try {
    const orderData = await Order.findById(orderId);
    log("info", `Order data: ${orderData}`); // DEBUGGING

    if (!orderData) {
      log("warn", `Order with ID ${orderId} not found`);
      return {
        didSucceed: false,
        details: { message: "File not found or an error has occured" },
      };
    }
    if (orderData.user.userId.toString() !== sessionUserId.toString()) {
      log(
        "warn",
        `Session user ID ${sessionUserId} unauthorized to retrieve invoice of order ${orderId}`
      );
      return {
        didSucceed: false,
        details: { message: "Unauthorized" },
      };
    }

    const invoiceName = `invoice-${orderId}.pdf`;

    return {
      didSucceed: true,
      details: { message: "Invoice retrieved successfully" },
      invoice: {
        orderId,
        orderData,
        invoiceName,
      },
    };
  } catch (error) {
    log("error", error);
    return {
      didSucceed: false,
      details: { message: "Invoice not found or an error has occured" },
    };
  }
};

export default mongoose.model("User", userSchema);
