import axiosClient from "../config/axios.config";

async function getAllProducts(params = {}) {
  try {
    const res = await axiosClient.get("/product", { params });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getProduct(id) {
  try {
    const res = await axiosClient.get(`/product/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function searchProducts(params = {}) {
  try {
    const queryParams = typeof params === "string" ? { q: params } : params;
    const searchParams = new URLSearchParams();

    if (queryParams.q) searchParams.append("q", queryParams.q);
    if (queryParams.query) searchParams.append("query", queryParams.query);
    if (queryParams.search) searchParams.append("search", queryParams.search);
    if (queryParams.categoryId)
      searchParams.append("categoryId", queryParams.categoryId);
    if (queryParams.minPrice !== undefined && queryParams.minPrice !== "")
      searchParams.append("minPrice", queryParams.minPrice);
    if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== "")
      searchParams.append("maxPrice", queryParams.maxPrice);
    if (queryParams.sortBy) searchParams.append("sortBy", queryParams.sortBy);
    if (queryParams.limit) searchParams.append("limit", queryParams.limit);
    if (queryParams.page) searchParams.append("page", queryParams.page);

    const res = await axiosClient.get(
      `/product/search?${searchParams.toString()}`,
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getPriceRange() {
  try {
    const res = await axiosClient.get("/product/pricerange");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getMaxPrice() {
  try {
    const res = await axiosClient.get("/product/pricerange");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getNewArrivals() {
  try {
    const res = await axiosClient.get("/product/newaravials");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export {
  getAllProducts,
  getProduct,
  searchProducts,
  getPriceRange,
  getMaxPrice,
  getNewArrivals,
};
