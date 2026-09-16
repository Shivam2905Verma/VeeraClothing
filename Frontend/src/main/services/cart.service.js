import axiosClient from "../config/axios.config";

export async function getCart() {
  try {
    const res = await axiosClient.get("/cart");
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error Form Get Cart", error);
    throw error;
  }
}

export async function addToCart(variant_id, quantity = 1) {
  try {
    const res = await axiosClient.post("/cart/add", { variant_id, quantity });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error Form Add to cart", error);
    throw error;
  }
}

export async function updateCart(cartItemId, quantity) {
  try {
    const res = await axiosClient.patch("/cart/updatequantity", {
      cartItemId,
      quantity,
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error Form Update Cart", error);
    throw error;
  }
}

export async function removeItemFromCart(cartItemId) {
  try {
    console.log(cartItemId);
    const res = await axiosClient.delete(`/cart/removeitem/${cartItemId}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error Form Remove Cart", error);
    throw error;
  }
}

export async function clearCart() {
  try {
    const res = await axiosClient.delete("/cart/clear");
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error Form Clear Cart", error);
    throw error;
  }
}
