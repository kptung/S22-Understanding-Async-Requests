import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  products: [
    {
      productData: {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
      },
      quantity: { type: Number, required: true },
    },
  ],
});

export default mongoose.model("Order", orderSchema);
