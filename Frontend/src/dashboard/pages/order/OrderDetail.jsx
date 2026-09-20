import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getDashboardOrderById,
  updateDashboardOrderStatus,
} from "../../service/order.service";
import Toast from "../../../common/Toast";
import style from "../../style/page/orderDetail.module.css";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("pending");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("pending");
  const [toast, setToast] = useState({ message: "", type: "error" });

  const showToast = (message, type = "error") => setToast({ message, type });

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await getDashboardOrderById(id);
      if (res?.order) {
        setOrder(res.order);
        setSelectedOrderStatus(res.order.order_status || "pending");
        setSelectedPaymentStatus(res.order.payment_status || "pending");
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      showToast(
        err?.response?.data?.message || "Failed to load order details.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateDashboardOrderStatus(id, {
        order_status: selectedOrderStatus,
        payment_status: selectedPaymentStatus,
      });
      showToast("Order status updated successfully!", "success");
      await fetchOrderDetails();
    } catch (err) {
      console.error("Failed to update order status:", err);
      showToast(
        err?.response?.data?.message || "Failed to update status.",
        "error",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={style.container}>
        <div style={{ padding: "80px", textAlign: "center", color: "#6b7280" }}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "2rem" }}
          />
          <p style={{ marginTop: "12px", fontSize: "0.9rem" }}>
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={style.container}>
        <Link to="/dashboard/orders" className={style.backBtn}>
          <i className="ri-arrow-left-line" />
          <span>Back to Orders</span>
        </Link>
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
          Order not found or failed to load.
        </div>
      </div>
    );
  }

  const rawDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateFormatted = rawDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = rawDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(order.final_amount || order.total_amount || 0));

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(order.total_amount || 0));

  // Determine Payment Status styling
  const paymentStatus = (order.payment_status || "pending").toLowerCase();
  let paymentClass = style.payPending;
  if (paymentStatus === "paid") paymentClass = style.payPaid;
  else if (paymentStatus === "failed") paymentClass = style.payFailed;
  else if (paymentStatus === "refunded") paymentClass = style.payRefunded;

  // Determine Order Fulfillment Status styling
  const orderStatus = (order.order_status || "pending").toLowerCase();
  let orderClass = style.orderPending;
  if (orderStatus === "delivered") orderClass = style.orderDelivered;
  else if (orderStatus === "shipped") orderClass = style.orderShipped;
  else if (orderStatus === "confirmed") orderClass = style.orderConfirmed;
  else if (orderStatus === "cancelled" || orderStatus === "returned")
    orderClass = style.orderCancelled;

  return (
    <div className={style.container}>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={4000}
      />

      {/* Header Bar */}
      <div className={style.headerBar}>
        <div className={style.headerLeft}>
          <Link to="/dashboard/orders" className={style.backBtn}>
            <i className="ri-arrow-left-line" />
            <span>Back to Orders</span>
          </Link>
          <div className={style.titleRow}>
            <h1 className={style.pageTitle}>
              Order #ORD-{String(order.id).padStart(4, "0")}
            </h1>
            <span className={style.headerDate}>
              Placed on {dateFormatted} at {timeFormatted}
            </span>
          </div>
        </div>

        <div className={style.headerBadges}>
          <span className={`${style.statusBadge} ${paymentClass}`}>
            <span className={style.statusDot} />
            Payment: {paymentStatus}
          </span>
          <span className={`${style.statusBadge} ${orderClass}`}>
            <span className={style.statusDot} />
            Status: {orderStatus}
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className={style.contentGrid}>
        {/* Left Column: Items & Measurements */}
        <div className={style.mainColumn}>
          {/* Ordered Items */}
          <div className={style.card}>
            <div className={style.cardHeader}>
              <h2 className={style.cardTitle}>
                <i className="ri-shopping-bag-3-line" />
                <span>Items in Order ({order.items?.length || 0})</span>
              </h2>
            </div>

            <div className={style.itemsList}>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className={style.itemRow}>
                    <div className={style.itemInfoLeft}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className={style.itemThumbnail}
                        />
                      ) : (
                        <div className={style.thumbPlaceholder}>
                          <i className="ri-image-line" />
                        </div>
                      )}
                      <div className={style.itemDetails}>
                        <span className={style.itemName}>
                          {item.product_name || "Product Item"}
                        </span>
                        <span className={style.itemMeta}>
                          Color: {item.color || "Standard"} • Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className={style.itemPrices}>
                      <span className={style.itemSubtotal}>
                        ₹{Number(item.subtotal || 0).toLocaleString("en-IN")}
                      </span>
                      <span className={style.itemUnitPrice}>
                        (₹{Number(item.price || 0).toLocaleString("en-IN")} each)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", color: "#6b7280" }}>
                  No items in this order.
                </div>
              )}
            </div>
          </div>

          {/* Custom Tailoring Measurements */}
          {order.measurements && order.measurements.length > 0 && (
            <div className={style.card}>
              <div className={style.cardHeader}>
                <h2 className={style.cardTitle}>
                  <i className="ri-ruler-2-line" />
                  <span>Custom Tailoring Measurements</span>
                </h2>
              </div>

              <div className={style.measGrid}>
                {order.measurements.map((m, idx) => (
                  <div key={idx} className={style.measItem}>
                    <span className={style.measLabel}>{m.type_name}</span>
                    <span className={style.measValue}>
                      {m.measurement_value} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Update Status + Customer + Shipping + Financial Summary */}
        <div className={style.sideColumn}>
          {/* Status Management Card */}
          <div className={style.card}>
            <div className={style.cardHeader}>
              <h2 className={style.cardTitle}>
                <i className="ri-edit-line" />
                <span>Edit Order Status</span>
              </h2>
            </div>

            <form
              onSubmit={handleUpdateStatus}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div className={style.formGroup}>
                <label className={style.formLabel}>Order Fulfillment</label>
                <select
                  value={selectedOrderStatus}
                  onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  className={style.selectInput}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div className={style.formGroup}>
                <label className={style.formLabel}>Payment Status</label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className={style.selectInput}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <button
                type="submit"
                className={style.updateBtn}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <i
                      className="ri-loader-4-line ri-spin"
                      style={{ fontSize: "1rem" }}
                    />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-save-line" />
                    <span>Save Order Status</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Customer Card */}
          <div className={style.card}>
            <div className={style.cardHeader}>
              <h2 className={style.cardTitle}>
                <i className="ri-user-line" />
                <span>Customer Info</span>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className={style.infoItem}>
                <span className={style.infoItemLabel}>Name</span>
                <span className={style.infoItemVal}>
                  {order.customer_name || "Guest Customer"}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.infoItemLabel}>Email</span>
                <span className={style.infoItemVal}>
                  {order.customer_email || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className={style.card}>
            <div className={style.cardHeader}>
              <h2 className={style.cardTitle}>
                <i className="ri-map-pin-line" />
                <span>Delivery Address</span>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className={style.infoItem}>
                <span className={style.infoItemLabel}>Recipient</span>
                <span className={style.infoItemVal}>
                  {order.firstname} {order.lastname}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.infoItemLabel}>Address</span>
                <span className={style.infoItemVal}>
                  {order.address_line_1}
                  {order.landmark ? `, ${order.landmark}` : ""}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {order.city}, {order.state} - {order.zip_code}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.infoItemLabel}>Phone</span>
                <span className={style.infoItemVal}>{order.phone}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className={style.card}>
            <div className={style.cardHeader}>
              <h2 className={style.cardTitle}>
                <i className="ri-money-dollar-circle-line" />
                <span>Payment Summary</span>
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className={style.summaryRow}>
                <span>Payment Method</span>
                <span style={{ fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>
                  {order.payment_method || "Online"}
                </span>
              </div>
              <div className={style.summaryRow}>
                <span>Items Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className={style.summaryRow} style={{ color: "#059669" }}>
                  <span>Discount</span>
                  <span>-₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className={style.summaryTotalRow}>
                <span>Total Paid</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
