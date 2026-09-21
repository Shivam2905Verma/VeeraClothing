import { useEffect, useState, useCallback } from "react";
import { getAllDashboardOrders } from "../../service/order.service";
import Toast from "../../../common/Toast";
import OrderTopBar from "../../components/orders/OrderTopBar";
import OrderCard from "../../components/orders/OrderCard";
import style from "../../style/page/order.module.css";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch orders with current filters and pagination
  const fetchOrders = useCallback(
    async (targetPage = 1, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = {
          page: targetPage,
          limit: 15,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (paymentStatusFilter !== "ALL") {
          params.payment_status = paymentStatusFilter;
        }

        if (orderStatusFilter !== "ALL") {
          params.order_status = orderStatusFilter;
        }

        const data = await getAllDashboardOrders(params);

        if (data?.orders) {
          if (isLoadMore) {
            setOrders((prev) => [...prev, ...data.orders]);
          } else {
            setOrders(data.orders);
          }

          setPage(targetPage);
          setHasMore(Boolean(data.hasMore));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        showToast(
          error?.response?.data?.message ||
            "Failed to load orders from server.",
          "error",
        );
      } finally {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [debouncedSearch, paymentStatusFilter, orderStatusFilter],
  );

  // Trigger initial fetch or reset on filter changes
  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  // Handle Load More click
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(page + 1, true);
    }
  };

  return (
    <div className={style.orderPage}>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={4000}
      />

      {/* TOP BAR Component */}
      <OrderTopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        orderStatusFilter={orderStatusFilter}
        setOrderStatusFilter={setOrderStatusFilter}
      />

      {/* ORDERS DATA TABLE */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "1.75rem", color: "#6b7280" }}
          />
        </div>
      ) : orders.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <i className="ri-inbox-line" style={{ fontSize: "2.5rem" }} />
          </div>
          <h3 className={style.emptyTitle}>No Orders Found</h3>
          <p className={style.emptySubtitle}>
            {searchQuery
              ? `No orders match "${searchQuery}". Try a different filter or search term.`
              : "No customer orders have been placed yet."}
          </p>
        </div>
      ) : (
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                {/* 1. Date Column */}
                <th className={style.tableHeader}>
                  <span>Date</span>
                </th>

                {/* 2. Order ID Column */}
                <th className={style.tableHeader}>
                  <span>Order ID</span>
                </th>

                {/* 3. Customer Name Column */}
                <th className={style.tableHeader}>
                  <span>Customer Name</span>
                </th>

                {/* 4. Total Column */}
                <th className={style.tableHeader}>
                  <span>Total</span>
                </th>

                {/* 5. Payment Status Column */}
                <th className={style.tableHeader}>
                  <span>Payment Status</span>
                </th>

                {/* 6. Order Status Column */}
                <th className={style.tableHeader}>
                  <span>Order Status</span>
                </th>

                {/* 7. Actions Column */}
                <th className={`${style.tableHeader} ${style.actionsHeader}`}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </tbody>
          </table>

          {/* Table Footer with Summary */}
          <div className={style.tableFooter}>
            <span className={style.footerInfo}>
              Showing {orders.length} orders
            </span>
          </div>
        </div>
      )}

      {/* Load More Button Section */}
      {!loading && hasMore && (
        <div className={style.loadMoreContainer}>
          <button
            type="button"
            className={style.loadMoreBtn}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <i className="ri-loader-4-line ri-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <i className="ri-arrow-down-line" />
                <span>Load More Orders</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* All Orders Loaded Info */}
      {!loading && !hasMore && orders.length >= 15 && (
        <div className={style.allLoadedText}>
          All orders loaded
        </div>
      )}
    </div>
  );
};

export default Order;
