import axiosClient from "../config/axios.config";

async function getAllProducts() {
  const res = await axiosClient.get("/product");
  console.log(res.data);
  return res.data;
}

async function getProduct(id) {
  const res = await axiosClient.get(`/product/${id}`);
  console.log(res.data);
  return res.data;
}

export { getAllProducts, getProduct };
