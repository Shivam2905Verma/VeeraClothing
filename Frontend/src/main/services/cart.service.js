import axiosClient from "../config/axios.config";

async function addToCart(variant_id, quantity = 1) {
  const res = await axiosClient.post("/cart/add", { variant_id, quantity });
  console.log(res.data);
  return res.data;
}

async function updateCart(cartItemId, quantity) {
  const res = await axiosClient.put("/cart/update", { cartItemId, quantity });
  console.log(res.data);
  return res.data;
}

async function removeFromCart() {
  const res = await axiosClient.delete("/cart/remove");
  console.log(res.data);
  return res.data;
}

async function getCart() {
  const res = await axiosClient.get("/cart");
  console.log(res.data);
  return res.data;
}

export { addToCart, updateCart, removeFromCart, getCart };
