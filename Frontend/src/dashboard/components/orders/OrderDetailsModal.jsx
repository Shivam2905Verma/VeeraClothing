import { useState, useEffect } from "react";
import {
  getDashboardOrderById,
  updateDashboardOrderStatus,
} from "../../service/order.service";
import style from "../../style/components/orderDetailsModal.module.css";

const OrderDetailsModal = ({ orderId, isOpen, onClose, onOrderUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("pending");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("pending");

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetails();
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getDashboardOrderById(orderId);
      if (res?.order) {
        setOrder(res.order);
        setSelectedOrderStatus(res.order.order_status || "pending");
        setSelectedPaymentStatus(res.order.payment_status || "pending");
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSave = async () => {
    try {
      setUpdating(true);
      await updateDashboardOrderStatus(orderId, {
        order_status: selectedOrderStatus,
        payment_status: selectedPaymentStatus,
      });
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(order?.final_amount || order?.total_amount || 0));

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={style.modalHeader}>
          <div className={style.modalTitleGroup}>
            <h2 className={style.modalTitle}>Order Details</h2>
            <span className={style.modalOrderBadge}>
              #ORD-{String(orderId).padStart(4, "0")}
            </span>
          </div>
          <button type="button" className={style.closeBtn} onClick={onClose}>
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Body */}
        <div className={style.modalBody}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              <i
                className="ri-loader-4-line ri-spin"
                style={{ fontSize: "1.5rem" }}
              />
              <p style={{ marginTop: "8px", fontSize: "0.85rem" }}>
                Loading order information...
              </p>
            </div>
          ) : !order ? (
            <p style={{ textAlign: "center", color: "#ef4444" }}>
              Could not load order details.
            </p>
          ) : (
            <>
              {/* Customer & Shipping Section */}
              <div className={style.sectionBlock}>
                <h3 className={style.sectionTitle}>Customer & Shipping</h3>
                <div className={style.grid2}>
                  <div className={style.infoCard}>
                    <span className={style.infoLabel}>Customer</span>
                    <span className={style.infoValue}>
                      {order.customer_name || "Guest Customer"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {order.customer_email || "No Email"}
                    </span>
                  </div>

                  <div className={style.infoCard}>
                    <span className={style.infoLabel}>Delivery Address</span>
                    <span className={style.infoValue}>
                      {order.firstname} {order.lastname}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {order.address_line_1}
                      {order.landmark ? `, ${order.landmark}` : ""}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {order.city}, {order.state} - {order.zip_code}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#111827", fontWeight: 600 }}>
                      Phone: {order.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className={style.sectionBlock}>
                <h3 className={style.sectionTitle}>Status Management</h3>
                <div className={style.grid2}>
                  <div className={style.infoCard}>
                    <span className={style.infoLabel}>Payment Status</span>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "0.85rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        outline: "none",
                        backgroundColor: "#ffffff",
                        marginTop: "4px",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className={style.infoCard}>
                    <span className={style.infoLabel}>Order Status</span>
                    <select
                      value={selectedOrderStatus}
                      onChange={(e) => setSelectedOrderStatus(e.target.value)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "0.85rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        outline: "none",
                        backgroundColor: "#ffffff",
                        marginTop: "4px",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              <div className={style.sectionBlock}>
                <h3 className={style.sectionTitle}>
                  Items ({order.items?.length || 0})
                </h3>
                <div className={style.itemList}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className={style.itemRow}>
                        <div className={style.itemLeft}>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className={style.itemThumb}
                            />
                          ) : (
                            <div
                              className={style.itemThumb}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#9ca3af",
                              }}
                            >
                              <i className="ri-image-line" />
                            </div>
                          )}
                          <div className={style.itemInfo}>
                            <span className={style.itemName}>
                              {item.product_name || "Product Item"}
                            </span>
                            <span className={style.itemMeta}>
                              Color: {item.color || "Standard"} • Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <span className={style.itemPrice}>
                          ₹{Number(item.subtotal || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "16px", color: "#6b7280", fontSize: "0.85rem" }}>
                      No items recorded in this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Tailoring Measurements if any */}
              {order.measurements && order.measurements.length > 0 && (
                <div className={style.sectionBlock}>
                  <h3 className={style.sectionTitle}>Custom Tailoring Measurements</h3>
                  <div className={style.measGrid}>
                    {order.measurements.map((m, idx) => (
                      <div key={idx} className={style.measPill}>
                        <span className={style.measName}>{m.type_name}</span>
                        <span className={style.measVal}>
                          {m.measurement_value} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={style.modalFooter}>
          <div className={style.totalSummary}>
            <span className={style.totalSummaryLabel}>Total Amount:</span>
            <span className={style.totalSummaryValue}>{formattedTotal}</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 14px",
                fontSize: "0.825rem",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                color: "#374151",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Close
            </button>
            <button
              type="button"
              disabled={updating || loading}
              onClick={handleStatusSave}
              style={{
                padding: "8px 16px",
                fontSize: "0.825rem",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#111827",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {updating ? (
                <>
                  <i
                    className="ri-loader-4-line ri-spin"
                    style={{ fontSize: "0.9rem" }}
                  />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <i className="ri-save-line" />
                  <span>Save Status</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
