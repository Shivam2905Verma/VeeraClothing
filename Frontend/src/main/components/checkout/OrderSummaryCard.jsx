import { Link } from "react-router-dom";
import style from "../../style/components/checkout/orderSummaryCard.module.css";

const OrderSummaryCard = ({
  cartList = [],
  subtotal = 0,
  deliveryFee = 0,
  grandTotal = 0,
  isSubmitting = false,
  onPlaceOrder,
}) => {
  const handlePlaceOrderClick = () => {
    if (onPlaceOrder) {
      onPlaceOrder();
    }
  };

  return (
    <div className={style.sidebarWrapper}>
      {/* Top Total & Quick Pay Button */}
      <div className={style.topTotalRow}>
        <span className={style.topTotalLabel}>Total</span>
        <span className={style.topTotalValue}>₹{grandTotal.toFixed(2)}</span>
      </div>

      <button
        type="button"
        className={style.primaryPayBtn}
        onClick={handlePlaceOrderClick}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <i className="ri-loader-4-line ri-spin" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <i className="ri-lock-2-line" />
            <span>Place Order & Pay</span>
          </>
        )}
      </button>

      <p className={style.termsText}>
        By placing your order, you agree to our{" "}
        <Link to="/terms">Terms and Conditions</Link> and{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      {/* Summary Card with Products */}
      <div className={style.summaryCard}>
        <h3 className={style.summaryTitle}>Order Summary</h3>

        {/* Items List */}
        <div className={style.itemList}>
          {cartList.map((item) => (
            <div key={item.variantId} className={style.itemRow}>
              <img
                src={item.image_url}
                alt={item.name}
                className={style.itemThumb}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/50?text=Item";
                }}
              />
              <div className={style.itemInfo}>
                <h4 className={style.itemName}>{item.name}</h4>
                <p className={style.itemMeta}>
                  {item.color} • Qty {item.quantity}
                </p>
              </div>
              <span className={style.itemPrice}>
                ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className={style.costBreakdown}>
          <div className={style.costRow}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className={style.costRow}>
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}.00`}</span>
          </div>

          <div className={style.totalRow}>
            <div>
              <span>Total</span>
              <div className={style.dutiesNote}>
                All taxes & duties included
              </div>
            </div>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
