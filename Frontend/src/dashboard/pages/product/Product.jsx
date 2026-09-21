import { useEffect, useState, useCallback } from "react";
import {
  searchDashboardProducts,
  activateProduct,
  deactivateProduct,
  deleteProduct,
} from "../../service/product.service";
import ConfirmModal from "../../../common/ConfirmModal";
import Toast from "../../../common/Toast";
import ProductTopBar from "../../components/products/product/ProductTopBar";
import ProductCard from "../../components/products/product/ProductCard";
import style from "../../style/page/product.module.css";

const PAGE_SIZE = 15;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Products Handler (Supports Search Query, Status Filter, and Server-Side Sort)
  const fetchProducts = useCallback(
    async (
      query = searchQuery,
      status = statusFilter,
      sort = sortBy,
    ) => {
      const q = typeof query === "string" ? query : searchQuery;
      const s = typeof status === "string" ? status : statusFilter;
      const sb = typeof sort === "string" ? sort : sortBy;
      try {
        setLoading(true);
        setPage(1);
        const data = await searchDashboardProducts(q, s, sb, 1, PAGE_SIZE);
        if (data && data.products) {
          setProducts(data.products);
          setHasMore(Boolean(data.hasMore));
          setTotalCount(Number(data.totalCount ?? data.products.length));
        }
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to load products.",
          "error",
        );
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, statusFilter, sortBy],
  );

  // Debounced effect whenever search query, status filter, or sortBy changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchQuery, statusFilter, sortBy);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, statusFilter, sortBy, fetchProducts]);

  // Load More Handler (loads page + 1 and appends to existing products with active search/filter/sort)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await searchDashboardProducts(
        searchQuery,
        statusFilter,
        sortBy,
        nextPage,
        PAGE_SIZE,
      );
      if (data && data.products) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(nextPage);
        setHasMore(Boolean(data.hasMore));
        if (data.totalCount !== undefined) {
          setTotalCount(Number(data.totalCount));
        }
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to load more products.",
        "error",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // Toggle Active / Deactive handler
  const handleToggleStatus = async (product) => {
    try {
      if (product.is_active) {
        await deactivateProduct(product.id);
        showToast(`"${product.name}" deactivated successfully.`, "success");
      } else {
        await activateProduct(product.id);
        showToast(`"${product.name}" activated successfully.`, "success");
      }

      // Optimistically update local state
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, is_active: !item.is_active }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle product status:", error);
      showToast(
        error.response?.data?.message || "Failed to update product status.",
        "error",
      );
    }
  };

  // Open delete confirmation modal
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Confirm permanent delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete.id);
      setProducts((prev) =>
        prev.filter((item) => item.id !== productToDelete.id),
      );
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast(`"${productToDelete.name}" deleted permanently.`, "success");
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast(
        error.response?.data?.message ||
          "Cannot permanently delete product (e.g., active orders exist). Please deactivate instead.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={style.productPage}>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={4000}
      />

      {/* TOP BAR Component */}
      <ProductTopBar
        totalCount={totalCount || products.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "1.75rem", color: "#6b7280" }}
          />
        </div>
      ) : products.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <i className="ri-inbox-line" style={{ fontSize: "2.5rem" }} />
          </div>
          <h3 className={style.emptyTitle}>No Products Found</h3>
          <p className={style.emptySubtitle}>
            {searchQuery
              ? `No products match "${searchQuery}". Try a different search term.`
              : "No products in inventory yet. Click 'Add Product' to get started."}
          </p>
        </div>
      ) : (
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                {/* Product Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Product</span>
                  </div>
                </th>

                {/* Status Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Status</span>
                  </div>
                </th>

                {/* Category Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Category</span>
                  </div>
                </th>

                {/* Price Column */}
                <th className={style.tableHeader}>
                  <div className={style.headerContent}>
                    <span>Price</span>
                  </div>
                </th>

                {/* Actions Column */}
                <th className={`${style.tableHeader} ${style.actionsHeader}`}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleOpenDelete}
                />
              ))}
            </tbody>
          </table>

          {/* Load More Button Container */}
          {hasMore && (
            <div className={style.loadMoreContainer}>
              <button
                type="button"
                className={style.loadMoreBtn}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <i
                      className="ri-loader-4-line ri-spin"
                      style={{ fontSize: "1rem" }}
                    />
                    <span>Loading more products...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-arrow-down-line" />
                    <span>Load More Products (15 more)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Table Footer with Summary */}
          <div className={style.tableFooter}>
            <span className={style.footerInfo}>
              Showing {products.length} of {totalCount || products.length}{" "}
              products
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? If there are past customer orders for this product, please deactivate it instead.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Product;
