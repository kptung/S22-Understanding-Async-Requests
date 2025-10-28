import newError from "./newError.js";
import createLogger from "./logger.js";
const log = createLogger(import.meta.url);

export default async function fillInvoicePDF(doc, invoiceData) {
  try {
    // log("info", JSON.stringify(invoiceData, null, 2)); // DEBUGGING

    const { orderId, orderData, invoiceName } = invoiceData;
    const { email } = orderData.user;

    const productDetails = orderData.products.map((product) => {
      return [
        product.productData.title,
        product.productData.price,
        product.quantity,
        `$${product.productData.price * product.quantity}`,
      ];
    });
    // console.log("🔥TEST 🔥 TEST🔥", productDetails); // DEBUGGING

    const tableData = {
      title: "Order details",
      headers: ["Product Name", "Price / Unit", "Quantity", "Total"],
      rows: productDetails,
    };

    const totalPrice = productDetails.reduce(
      (acc, curr) => acc + curr[1] * curr[2],
      0
    );

    doc
      .fontSize(14)
      .text(`Your order ID: ${orderId}`, { align: "center", underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Invoice "${invoiceName}" for user ${email}`);
    doc.moveDown(1.5);

    await doc.table(tableData, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: () => doc.font("Helvetica").fontSize(10),
    });

    doc.moveDown(2.5);
    doc.fontSize(18).text(`Total price: $${totalPrice.toFixed(2)}`);

    log(
      "success",
      `Invoice "${invoiceName}" created and filled with order data`
    );

    return;
  } catch (error) {
    log("error", error);
    throw newError("Failed to fill InvoicePDF", error);
  }
}
