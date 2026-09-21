import { Link } from "react-router-dom";
import style from "../../style/components/orderCard.module.css";

const OrderCard = ({ order }) => {
  if (!order) return null;

  // Format Date
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

  // Format Total Amount
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(order.final_amount || 0));

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

  const customerDisplayName =
    order.customer_name ||
    (order.recipient_firstname
      ? `${order.recipient_firstname} ${order.recipient_lastname || ""}`
      : "Guest Customer");

  return (
    <tr className={style.tableRow}>
      {/* 1. Date Column */}
      <td className={style.dateCell}>
        <div className={style.dateWrapper}>
          <span className={style.dateMain}>{dateFormatted}</span>
          <span className={style.dateSub}>{timeFormatted}</span>
        </div>
      </td>

      {/* 2. Order ID Column */}
      <td className={style.orderIdCell}>
        <Link
          to={`/dashboard/orders/${order.id}`}
          className={style.orderIdBadge}
          style={{ textDecoration: "none" }}
        >
          #ORD-{String(order.id).padStart(4, "0")}
        </Link>
      </td>

      {/* 3. Customer Name Column */}
      <td className={style.customerCell}>
        <div className={style.customerWrapper}>
          <Link
            to={`/dashboard/orders/${order.id}`}
            className={style.customerName}
            style={{ textDecoration: "none" }}
          >
            {customerDisplayName}
          </Link>
          <span className={style.customerSub}>
            {order.customer_email || order.phone || "No contact info"}
          </span>
        </div>
      </td>

      {/* 4. Total Column */}
      <td className={style.totalCell}>
        <div className={style.totalWrapper}>
          <span className={style.totalValue}>{formattedTotal}</span>
          <span className={style.paymentMethodSub}>
            {order.payment_method || "Online"}
          </span>
        </div>
      </td>

      {/* 5. Payment Status Column */}
      <td className={style.statusCell}>
        <span className={`${style.statusBadge} ${paymentClass}`}>
          <span className={style.statusDot} />
          {paymentStatus}
        </span>
      </td>

      {/* 6. Order Status Column */}
      <td className={style.statusCell}>
        <span className={`${style.statusBadge} ${orderClass}`}>
          <span className={style.statusDot} />
          {orderStatus}
        </span>
      </td>

      {/* 7. Actions Column */}
      <td className={style.actionsCell}>
        <div className={style.actionButtons}>
          <Link
            to={`/dashboard/orders/${order.id}`}
            className={style.viewDetailsBtn}
            title="View Order Details"
            style={{ textDecoration: "none" }}
          >
            <i className="ri-eye-line" />
            <span>Details</span>
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default OrderCard;
