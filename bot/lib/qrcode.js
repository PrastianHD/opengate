// QR code generator for Telegram bot.
import QRCode from "qrcode";

/**
 * Generate QR code PNG buffer from a string.
 * @param {string} text - Text to encode (e.g., QRIS payment string)
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateQR(text) {
  return QRCode.toBuffer(text, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
