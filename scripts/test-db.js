import { mongoConnect, close } from "../src/db/database.js";

import User from "../models/user.js";
import Product from "../models/product.js";

(async () => {
  try {
    await mongoConnect();

    const productData = await Product.fetchAll();
    const userData = await User.find();

    console.log("===== DB connection OK =====\n");
    console.log("--- Product data: ---", productData);
    console.log("\n--- User data: ---", userData);
  } catch (error) {
    console.error("===== DB connection FAILED =====");
    console.error(error.message);
    process.exit(1);
  } finally {
    await close();
  }
})();
