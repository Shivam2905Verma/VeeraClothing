import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { brandDetail } from "../../../common/brandDetail";
import Toast from "../../../common/Toast";
import {
  getDashboardAnalytics,
  getDashboardOverview,
} from "../../service/dashboard.service";
import style from "../../style/page/dashboard.module.css";

// Helper to format Date object into YYYY-MM-DD
const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to compute start & end dates based on preset
const getPresetDates = (preset) => {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  switch (preset) {
    case "today":
      return { startDate: formatDate(start), endDate: formatDate(end) };
    case "yesterday":
      start.setDate(now.getDate() - 1);
      end.setDate(now.getDate() - 1);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    case "7days":
      start.setDate(now.getDate() - 6);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    case "30days":
      start.setDate(now.getDate() - 29);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    case "thisMonth":
      start.setDate(1);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    case "all":
      return { startDate: "", endDate: "" };
    default:
      return { startDate: "", endDate: "" };
  }
};

// Currency formatter
const formatCurrency = (amount) => {
  const val = Number(amount) || 0;
  return `₹${val.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Date/time formatter for orders
const formatOrderDate = (timestamp) => {
  if (!timestamp) return "-";
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const Dashboard = () => {
  // Date filter state (Default to last 30 days)
  const [selectedPreset, setSelectedPreset] = useState("30days");
  const initialDates = useMemo(() => getPresetDates("30days"), []);
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);

  // Data states
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
  });
  const [overview, setOverview] = useState({
    totalActiveProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
  });

  // Loading and feedback states
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // 1. Fetch overview (products, customers, recent 10 orders)
  const fetchOverview = useCallback(async () => {
    try {
      setOverviewLoading(true);
      const res = await getDashboardOverview();
      if (res?.success && res?.data) {
        setOverview(res.data);
      }

      console.log("overview res : ", res);
    } catch (error) {
      console.error("Failed to fetch dashboard overview:", error);
      showToast(
        error?.response?.data?.message || "Failed to load store overview.",
        "error",
      );
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  // 2. Fetch analytics (revenue & orders for selected date range)
  const fetchAnalytics = useCallback(async (start, end) => {
    try {
      setAnalyticsLoading(true);
      const res = await getDashboardAnalytics({
        startDate: start || undefined,
        endDate: end || undefined,
      });

      console.log("analytics res : ", res);
      if (res?.success && res?.data) {
        setAnalytics(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard analytics:", error);
      showToast(
        error?.response?.data?.message || "Failed to load analytics metrics.",
        "error",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Refetch analytics on date range change
  useEffect(() => {
    fetchAnalytics(startDate, endDate);
  }, [startDate, endDate, fetchAnalytics]);

  // Handle preset change
  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (preset !== "custom") {
      const dates = getPresetDates(preset);
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
    }
  };

  // Handle custom date inputs
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setSelectedPreset("custom");
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setSelectedPreset("custom");
  };

  return (
    <div className={style.dashboardPage}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />

      {/* Header Row */}
      <div className={style.pageHeader}>
        <div>
          <h1 className={style.welcomeTitle}>Insights & Overview</h1>
          <p className={style.welcomeSubtitle}>
            Welcome back. Real-time store performance for{" "}
            {brandDetail.brandName}.
          </p>
        </div>

        <div className={style.headerActions}>
          <Link to="/dashboard/products/add" className={style.primaryActionBtn}>
            <i className="ri-add-line" />
            <span>
              Add <span className={style.btnSuffix}>Product</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className={style.filterToolbar}>
        <div className={style.filterGroup}>
          <div className={style.presetButtons}>
            {[
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "7days", label: "Last 7 Days" },
              { key: "30days", label: "Last 30 Days" },
              { key: "thisMonth", label: "This Month" },
              { key: "all", label: "All Time" },
              { key: "custom", label: "Custom" },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                className={`${style.presetBtn} ${
                  selectedPreset === p.key ? style.presetBtnActive : ""
                }`}
                onClick={() => handlePresetChange(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className={style.dateRangeInputs}>
            <div className={style.dateInputWrapper}>
              <span className={style.dateInputLabel}>From:</span>
              <div className={style.inputWithIcon}>
                <i className="ri-calendar-line" />
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className={style.dateInput}
                  max={endDate || undefined}
                />
              </div>
            </div>

            <div className={style.dateInputWrapper}>
              <span className={style.dateInputLabel}>To:</span>
              <div className={style.inputWithIcon}>
                <i className="ri-calendar-line" />
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className={style.dateInput}
                  min={startDate || undefined}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Range Display / Info */}
        <div className={style.activeRangeBadge}>
          <i
            className={
              analyticsLoading
                ? `ri-loader-4-line ${style.loadingSpinner}`
                : "ri-time-line"
            }
          />
          <span>
            {analyticsLoading
              ? "Updating metrics..."
              : startDate && endDate
                ? `${startDate} → ${endDate}`
                : selectedPreset === "all"
                  ? "All Historical Data"
                  : "Custom Range"}
          </span>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className={style.statsGrid}>
        {/* Total Revenue */}
        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Total Revenue</span>
            <span className={style.trendPositive}>
              {analytics.paidOrders} paid orders
            </span>
          </div>
          <span className={style.statValue}>
            {analyticsLoading ? "..." : formatCurrency(analytics.totalRevenue)}
          </span>
          <span className={style.statFootnote}>
            {selectedPreset === "all"
              ? "All-time settled revenue"
              : `In selected period`}
          </span>
        </div>

        {/* Total Orders */}
        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Total Orders</span>
            <span
              className={
                analytics.pendingOrders > 0
                  ? style.trendNeutral
                  : style.trendPositive
              }
            >
              {analytics.pendingOrders} pending
            </span>
          </div>
          <span className={style.statValue}>
            {analyticsLoading ? "..." : analytics.totalOrders}
          </span>
          <span className={style.statFootnote}>
            {selectedPreset === "all"
              ? "All-time order count"
              : `In selected period`}
          </span>
        </div>

        {/* Active Products */}
        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Active Products</span>
            <span className={style.trendNeutral}>Live in store</span>
          </div>
          <span className={style.statValue}>
            {overviewLoading ? "..." : overview.totalActiveProducts}
          </span>
          <span className={style.statFootnote}>Published catalog items</span>
        </div>

        {/* Customers */}
        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Total Customers</span>
            <span className={style.trendPositive}>Registered</span>
          </div>
          <span className={style.statValue}>
            {overviewLoading ? "..." : overview.totalCustomers}
          </span>
          <span className={style.statFootnote}>Active user accounts</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className={style.tableSection}>
        <div className={style.tableHeaderArea}>
          <div className={style.tableTitleRow}>
            <h2 className={style.sectionHeading}>Recent Orders</h2>
            <span className={style.countBadge}>
              {overview.recentOrders.length}
            </span>
          </div>
          <Link to="/dashboard/orders" className={style.viewAllLink}>
            <span>View all orders</span>
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                <th className={style.th}>Order ID</th>
                <th className={style.th}>Customer</th>
                <th className={style.th}>Items</th>
                <th className={style.th}>Total</th>
                <th className={style.th}>Payment</th>
                <th className={style.th}>Fulfillment</th>
                <th className={style.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {overviewLoading ? (
                <tr>
                  <td colSpan="7" className={style.emptyStateRow}>
                    <i
                      className={`ri-loader-4-line ${style.loadingSpinner}`}
                      style={{ marginRight: 6 }}
                    />
                    Loading recent orders...
                  </td>
                </tr>
              ) : overview.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className={style.emptyStateRow}>
                    No orders found in store yet.
                  </td>
                </tr>
              ) : (
                overview.recentOrders.map((ord) => {
                  const isPaid =
                    (ord.paymentStatus || "").toLowerCase() === "paid";
                  const isShipped = ["shipped", "delivered"].includes(
                    (ord.orderStatus || "").toLowerCase(),
                  );
                  const isCancelled = ["cancelled", "returned"].includes(
                    (ord.orderStatus || "").toLowerCase(),
                  );

                  return (
                    <tr key={ord.id} className={style.tableRow}>
                      <td className={style.td}>
                        <Link
                          to={`/dashboard/orders/${ord.id}`}
                          className={style.orderIdLink}
                          style={{ textDecoration: "none" }}
                        >
                          {ord.orderIdFormatted || `ORD-${ord.id}`}
                        </Link>
                      </td>
                      <td className={style.td}>
                        <span className={style.customerName}>
                          {ord.customerName}
                        </span>
                      </td>
                      <td className={style.td}>
                        <span className={style.itemCount}>
                          {ord.totalItems}{" "}
                          {ord.totalItems === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className={style.td}>
                        <span className={style.orderTotal}>
                          {formatCurrency(ord.totalAmount)}
                        </span>
                      </td>
                      <td className={style.td}>
                        <span
                          className={`${style.stateBadge} ${
                            isPaid ? style.stateSettled : style.statePending
                          }`}
                        >
                          {ord.paymentStatus
                            ? ord.paymentStatus.toUpperCase()
                            : "PENDING"}
                        </span>
                      </td>
                      <td className={style.td}>
                        <span
                          className={`${style.stateBadge} ${
                            isShipped
                              ? style.stateShipped
                              : isCancelled
                                ? style.stateCancelled
                                : style.statePending
                          }`}
                        >
                          {ord.orderStatus || "pending"}
                        </span>
                      </td>
                      <td className={style.td}>
                        <span className={style.orderDate}>
                          {formatOrderDate(ord.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
