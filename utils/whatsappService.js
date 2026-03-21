import axios from "axios";
import Business from "../schemas/businessSchema.js";
import Product from "../schemas/productSchema.js";

export const sendOrderNotification = async ({
  businessId,
  orderNumber,
  companyName,
  phone,
  items,
}) => {
  try {
    const business = await Business.findById(businessId).lean();

    if (!business?.whatsappNumbers?.length) return;

    // -----------------------------
    // FORMAT ITEMS (WHATSAPP SAFE)
    // -----------------------------
const itemsText = items
  .map((item, index) => {
    const variant = [item.variant?.size, item.variant?.color]
      .filter(Boolean)
      .join("-");

    return `${index + 1}) ${item.name} (${variant}) x${item.quantity}`;
  })
  .join(" • ");

    const formattedPhone = phone ? phone.replace("+", "") : "N/A";

    // -----------------------------
    // SEND TO ALL NUMBERS
    // -----------------------------
    for (const number of business.whatsappNumbers) {
      const formattedNumber = number.replace("+", "");

      await axios.post(
        `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "template",
          template: {
            name: "new_order_notification",
            language: {
              code: "en_US",
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: orderNumber },
                  { type: "text", text: companyName || "N/A" },
                  { type: "text", text: formattedPhone },
                  { type: "text", text: itemsText },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (err) {
    console.error("WhatsApp Error:", err.response?.data || err.message);
  }
};


