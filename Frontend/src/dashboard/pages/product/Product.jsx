import { useEffect, useState, useMemo } from "react";
import {
  getAllProducts,
  activateProduct,
  deactivateProduct,
  deleteProduct,
} from "../../service/product.service";
import ConfirmModal from "../../../common/ConfirmModal";
import Toast from "../../../common/Toast";
import ProductTopBar from "../../components/products/product/ProductTopBar";
import ProductCard from "../../components/products/product/ProductCard";
import style from "../../style/page/product.module.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getAllProducts();
        if (isMounted && data && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (isMounted) {
          showToast(
            "Failed to load products. Please check your network.",
            "error",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products based on search query (name, description, id, or price)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        String(item.id).includes(query) ||
        String(item.price).includes(query),
    );
  }, [products, searchQuery]);

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
        totalCount={products.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* PRODUCTS LIST */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "2rem" }}
          />
        </div>
      ) : filteredProducts.length === 0 ? (
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
        <div className={style.productList}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleStatus={handleToggleStatus}
              onDelete={handleOpenDelete}
            />
          ))}
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
