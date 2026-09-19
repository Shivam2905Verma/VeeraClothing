import axiosClient from "../config/axios.config";

async function getAllProducts(params = {}) {
  const res = await axiosClient.get("/product", { params });
  return res.data;
}

async function getProduct(id) {
  const res = await axiosClient.get(`/product/${id}`);
  return res.data;
}

async function searchProducts(params = {}) {
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
}

async function getPriceRange() {
  const res = await axiosClient.get("/product/price-range");
  return res.data;
}

async function getMaxPrice() {
  const res = await axiosClient.get("/product/pricerange");
  return res.data;
}

export {
  getAllProducts,
  getProduct,
  searchProducts,
  getPriceRange,
  getMaxPrice,
};
