import { useState, useRef, useEffect } from "react";
import style from "../../style/components/orderTopBar.module.css";

const OrderTopBar = ({
  searchQuery = "",
  setSearchQuery,
  paymentStatusFilter = "ALL",
  setPaymentStatusFilter,
  orderStatusFilter = "ALL",
  setOrderStatusFilter,
}) => {
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const paymentDropdownRef = useRef(null);
  const orderDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        paymentDropdownRef.current &&
        !paymentDropdownRef.current.contains(e.target)
      ) {
        setShowPaymentMenu(false);
      }
      if (
        orderDropdownRef.current &&
        !orderDropdownRef.current.contains(e.target)
      ) {
        setShowOrderMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const paymentOptions = [
    { label: "All Payments", value: "ALL" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];

  const orderOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Returned", value: "returned" },
  ];

  return (
    <div>
      {/* 1. Page Header Row: Title on Left */}
      <div className={style.headerRow}>
        <div className={style.titleArea}>
          <h1 className={style.pageTitle}>Orders</h1>
        </div>
      </div>

      {/* 2. Filter & Toolbar Row */}
      <div className={style.toolbarRow}>
        <div className={style.toolbarLeft}>
          {/* Search Input */}
          <div className={style.filterInputWrapper}>
            <span className={style.filterIcon}>
              <i className="ri-search-line" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.filterInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={style.clearBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Clear filter"
              >
                <i className="ri-close-line" />
              </button>
            )}
          </div>

          {/* Payment Status Dropdown Pill */}
          <div style={{ position: "relative" }} ref={paymentDropdownRef}>
            <button
              type="button"
              className={`${style.filterPill} ${
                paymentStatusFilter !== "ALL" ? style.filterPillActive : ""
              }`}
              onClick={() => setShowPaymentMenu(!showPaymentMenu)}
            >
              <i className="ri-money-dollar-circle-line" style={{ fontSize: "0.9rem" }} />
              <span>
                {paymentStatusFilter === "ALL"
                  ? "Payment Status"
                  : paymentStatusFilter.toUpperCase()}
              </span>
              <i
                className="ri-arrow-down-s-line"
                style={{ fontSize: "0.85rem", opacity: 0.6 }}
              />
            </button>

            {showPaymentMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  zIndex: 60,
                  minWidth: "170px",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {paymentOptions.map((opt) => {
                  const isSelected = paymentStatusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 8px",
                        fontSize: "0.825rem",
                        border: "none",
                        borderRadius: "4px",
                        background: isSelected ? "#f3f4f6" : "transparent",
                        color: "#111827",
                        fontWeight: isSelected ? "600" : "400",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onClick={() => {
                        if (setPaymentStatusFilter)
                          setPaymentStatusFilter(opt.value);
                        setShowPaymentMenu(false);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        style={{ cursor: "pointer", accentColor: "#111827" }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Fulfillment Status Dropdown Pill */}
          <div style={{ position: "relative" }} ref={orderDropdownRef}>
            <button
              type="button"
              className={`${style.filterPill} ${
                orderStatusFilter !== "ALL" ? style.filterPillActive : ""
              }`}
              onClick={() => setShowOrderMenu(!showOrderMenu)}
            >
              <i className="ri-truck-line" style={{ fontSize: "0.9rem" }} />
              <span>
                {orderStatusFilter === "ALL"
                  ? "Order Status"
                  : orderStatusFilter.toUpperCase()}
              </span>
              <i
                className="ri-arrow-down-s-line"
                style={{ fontSize: "0.85rem", opacity: 0.6 }}
              />
            </button>

            {showOrderMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  zIndex: 60,
                  minWidth: "170px",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {orderOptions.map((opt) => {
                  const isSelected = orderStatusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 8px",
                        fontSize: "0.825rem",
                        border: "none",
                        borderRadius: "4px",
                        background: isSelected ? "#f3f4f6" : "transparent",
                        color: "#111827",
                        fontWeight: isSelected ? "600" : "400",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onClick={() => {
                        if (setOrderStatusFilter) setOrderStatusFilter(opt.value);
                        setShowOrderMenu(false);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        style={{ cursor: "pointer", accentColor: "#111827" }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTopBar;
