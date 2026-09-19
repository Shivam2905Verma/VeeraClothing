import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ShopHeader from "../../components/shop/ShopHeader";
import ShopFilter from "../../components/shop/ShopFilter";
import ShopProductGrid from "../../components/shop/ShopProductGrid";
import Toast from "../../../common/Toast";
import style from "../../style/pages/shopall.module.css";
import {
  getAllProducts,
  searchProducts,
  getMaxPrice,
} from "../../services/product.service";

const ShopAll = () => {
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  const [searchParams] = useSearchParams();
  const searchQuery = (
    searchParams.get("query") ||
    searchParams.get("search") ||
    searchParams.get("q") ||
    ""
  ).trim();
  const categoryName = (searchParams.get("category") || "").trim();
  const categoryIdFilter = searchParams.get("categoryId");

  // Display title: search query, or category name, or "All Products"
  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : categoryName
      ? categoryName
      : "All Products";

  const [minLimit, setMinLimit] = useState(0);
  const [maxLimit, setMaxLimit] = useState(2500);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(0);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState("default");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasUserFilteredPriceRef = useRef(false);
  const requestIdRef = useRef(0);

  // Reset price interaction flag when category or search changes
  useEffect(() => {
    hasUserFilteredPriceRef.current = false;
  }, [searchQuery, categoryName, categoryIdFilter]);

  // Fetch initial min & max price range from backend
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const res = await getMaxPrice();
        if (res && res.success && res.maxPrice) {
          setMinLimit(res.minPrice);
          setMaxLimit(res.maxPrice);
          setMinPrice(res.minPrice);
          setMaxPrice(res.maxPrice);
          setDebouncedMinPrice(res.minPrice);
          setDebouncedMaxPrice(res.maxPrice);
        }
      } catch (error) {
        console.error("Failed to fetch price range:", error);
      }
    };
    fetchPriceRange();
  }, []);

  // Debounce price slider/input changes to avoid firing requests on every pixel drag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 400);

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Fetch products whenever sort, price range, search, or category changes
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    const fetchProducts = async () => {
      try {
        const hasUrlQuery = Boolean(searchQuery || categoryIdFilter || categoryName);
        setPage(1);

        const queryParams = {
          sortBy,
          page: 1,
          limit: 18,
        };

        // Apply price filters once user interacts
        if (hasUserFilteredPriceRef.current) {
          queryParams.minPrice = debouncedMinPrice;
          queryParams.maxPrice = debouncedMaxPrice;
        }

        let res;
        if (hasUrlQuery) {
          if (searchQuery) queryParams.q = searchQuery;
          if (categoryIdFilter) queryParams.categoryId = categoryIdFilter;
          else if (categoryName && !searchQuery) queryParams.q = categoryName;

          res = await searchProducts(queryParams);
        } else {
          res = await getAllProducts(queryParams);
        }

        console.log("Shop all search :- ", res);

        // Only update state if this is the latest in-flight request
        if (currentRequestId === requestIdRef.current) {
          if (res && res.products) {
            setProductsData(res.products);
            setHasMore(Boolean(res.hasMore));
          }
        }
      } catch (error) {
        if (currentRequestId === requestIdRef.current) {
          console.error("Failed to fetch products in ShopAll:", error);
          showToast(
            error?.response?.data?.message || "Failed to fetch products",
            "error",
          );
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [
    sortBy,
    debouncedMinPrice,
    debouncedMaxPrice,
    searchQuery,
    categoryName,
    categoryIdFilter,
  ]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const hasUrlQuery = Boolean(searchQuery || categoryIdFilter || categoryName);
      const queryParams = {
        sortBy,
        page: nextPage,
        limit: 18,
      };

      if (hasUserFilteredPriceRef.current) {
        queryParams.minPrice = debouncedMinPrice;
        queryParams.maxPrice = debouncedMaxPrice;
      }

      let res;
      if (hasUrlQuery) {
        if (searchQuery) queryParams.q = searchQuery;
        if (categoryIdFilter) queryParams.categoryId = categoryIdFilter;
        else if (categoryName && !searchQuery) queryParams.q = categoryName;

        res = await searchProducts(queryParams);
      } else {
        res = await getAllProducts(queryParams);
      }

      if (res && res.products) {
        setProductsData((prev) => [...prev, ...res.products]);
        setPage(nextPage);
        setHasMore(Boolean(res.hasMore));
      }
    } catch (error) {
      console.error("Failed to load more products:", error);
      showToast(
        error?.response?.data?.message || "Failed to load more products",
        "error",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePriceChange = (newMin, newMax) => {
    hasUserFilteredPriceRef.current = true;
    setMinPrice(newMin);
    setMaxPrice(newMax);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  return (
    <div className={style.container}>
      <ShopHeader
        title={pageTitle}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        isMobileFilterOpen={isMobileFilterOpen}
        onToggleMobileFilter={setIsMobileFilterOpen}
      />

      <div className={style.mainLayout}>
        <ShopFilter
          minLimit={minLimit}
          maxLimit={maxLimit}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          isMobileFilterOpen={isMobileFilterOpen}
        />

        <ShopProductGrid
          products={productsData}
          isLoading={isLoading}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
};

export default ShopAll;
