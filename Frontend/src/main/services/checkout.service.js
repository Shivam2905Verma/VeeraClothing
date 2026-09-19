import axiosClient from "../config/axios.config";

export async function getPaymentMethods() {
  try {
    const res = await axiosClient.get("/checkout/paymentmethods");
    return res.data;
  } catch (error) {
    console.error("Error in getPaymentMethods:", error);
    throw error;
  }
}

export async function placeOrder(orderPayload) {
  try {
    const res = await axiosClient.post("/checkout/place-order", orderPayload);
    return res.data;
  } catch (error) {
    console.error("Error in placeOrder:", error);
    throw error;
  }
}
