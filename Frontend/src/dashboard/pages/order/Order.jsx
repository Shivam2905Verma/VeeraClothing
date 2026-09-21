import { useEffect, useState, useMemo } from "react";
import { getAllDashboardOrders } from "../../service/order.service";
import Toast from "../../../common/Toast";
import OrderTopBar from "../../components/orders/OrderTopBar";
import OrderCard from "../../components/orders/OrderCard";
import style from "../../style/page/order.module.css";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllDashboardOrders();
      console.log(data);
      if (data?.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showToast(
        error?.response?.data?.message || "Failed to load orders from server.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search query, payment status & order status
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Payment Status Filter
    if (paymentStatusFilter !== "ALL") {
      result = result.filter(
        (o) =>
          (o.payment_status || "pending").toLowerCase() ===
          paymentStatusFilter.toLowerCase(),
      );
    }

    // 2. Order Fulfillment Status Filter
    if (orderStatusFilter !== "ALL") {
      result = result.filter(
        (o) =>
          (o.order_status || "pending").toLowerCase() ===
          orderStatusFilter.toLowerCase(),
      );
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          String(o.id).includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_email?.toLowerCase().includes(q) ||
          o.recipient_firstname?.toLowerCase().includes(q) ||
          o.recipient_lastname?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          o.payment_method?.toLowerCase().includes(q) ||
          String(o.final_amount).includes(q),
      );
    }

    // 4. Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (
        sortField === "id" ||
        sortField === "final_amount" ||
        sortField === "total_amount"
      ) {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      } else if (sortField === "createdAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    orders,
    searchQuery,
    paymentStatusFilter,
    orderStatusFilter,
    sortField,
    sortDirection,
  ]);

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
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
        totalCount={orders.length}
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
      ) : filteredOrders.length === 0 ? (
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
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("createdAt")}
                >
                  <div className={style.headerContent}>
                    <span>Date</span>
                    {sortField === "createdAt" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* 2. Order ID Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("id")}
                >
                  <div className={style.headerContent}>
                    <span>Order ID</span>
                    {sortField === "id" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* 3. Customer Name Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("customer_name")}
                >
                  <div className={style.headerContent}>
                    <span>Customer Name</span>
                    {sortField === "customer_name" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* 4. Total Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("final_amount")}
                >
                  <div className={style.headerContent}>
                    <span>Total</span>
                    {sortField === "final_amount" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* 5. Payment Status Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("payment_status")}
                >
                  <div className={style.headerContent}>
                    <span>Payment Status</span>
                    {sortField === "payment_status" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* 6. Order Status Column */}
                <th
                  className={`${style.tableHeader} ${style.sortableHeader}`}
                  onClick={() => handleSort("order_status")}
                >
                  <div className={style.headerContent}>
                    <span>Order Status</span>
                    {sortField === "order_status" && (
                      <i
                        className={
                          sortDirection === "asc"
                            ? "ri-arrow-up-line"
                            : "ri-arrow-down-line"
                        }
                      />
                    )}
                  </div>
                </th>

                {/* 7. Actions Column */}
                <th className={`${style.tableHeader} ${style.actionsHeader}`}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </tbody>
          </table>

          {/* Table Footer with Summary */}
          <div className={style.tableFooter}>
            <span className={style.footerInfo}>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
