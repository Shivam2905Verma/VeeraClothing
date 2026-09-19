import { useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainContext } from "../../context/MainContext";
import { placeOrder } from "../../services/checkout.service";
import Toast from "../../../common/Toast";
import DeliveryAddressSection from "../../components/checkout/DeliveryAddressSection";
import CustomMeasurementsSection from "../../components/checkout/CustomMeasurementsSection";
import DeliveryMethodSection from "../../components/checkout/DeliveryMethodSection";
import PaymentMethodSection from "../../components/checkout/PaymentMethodSection";
import OrderSummaryCard from "../../components/checkout/OrderSummaryCard";
import style from "../../style/pages/checkout.module.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, cartItems, fetchCart } = useContext(MainContext);

  // Cart list & totals calculations
  const cartList = useMemo(() => Object.values(cartItems || {}), [cartItems]);

  const subtotal = useMemo(() => {
    return cartList.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
      0,
    );
  }, [cartList]);

  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + deliveryFee;

  // Checkout form data states gathered from modular components
  const [confirmedAddress, setConfirmedAddress] = useState(null);
  const [customMeasurements, setCustomMeasurements] = useState({});
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);

  // Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Place Order Action Handler
  const handlePlaceOrder = async () => {
    if (!user) {
      showToast("Please sign in to place your order.", "error");
      navigate("/login");
      return;
    }

    if (cartList.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    if (!confirmedAddress) {
      showToast(
        "Please fill in and confirm your delivery address before proceeding.",
        "error",
      );
      return;
    }

    if (!selectedPaymentMethodId) {
      showToast("Please select a valid payment method.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      cartList.map((item) => item.variantId);

      const orderPayload = {
        order: {
          addressId: confirmedAddress.id,
          paymentMethodId: selectedPaymentMethodId,
          orderStatus: "pending",
          paymentStatus: "pending",
        },
        measurements: customMeasurements,
      };

      const res = await placeOrder(orderPayload);

      if (res?.success) {
        showToast("Order placed successfully!", "success");
        await fetchCart();
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to place order. Please check your information and try again.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty
  if (cartList.length === 0) {
    return (
      <div className={style.checkoutPage}>
        <div className={style.container}>
          <div className={style.emptyCartView}>
            <i className={`ri-shopping-bag-line ${style.emptyIcon}`} />
            <h2 className={style.emptyTitle}>Your Cart is Empty</h2>
            <p className={style.emptySubtitle}>
              You don't have any items in your bag to checkout yet. Explore our
              luxury collection to add items.
            </p>
            <Link to="/shopall" className={style.shopBtn}>
              <span>Explore Collection</span>
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.checkoutPage}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={5000}
      />

      <div className={style.container}>
        {/* Page Top Header */}
        <div className={style.pageHeader}>
          <h1 className={style.pageTitle}>Checkout</h1>
          <Link to="/cart" className={style.backToCart}>
            <i className="ri-arrow-left-s-line" />
            <span>Return to Shopping Bag</span>
          </Link>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className={style.layoutGrid}>
          {/* LEFT COLUMN: Modular Sections */}
          <div className={style.stepsContainer}>
            {/* Section 1: Delivery Address */}
            <DeliveryAddressSection
              showToast={showToast}
              selectedAddress={confirmedAddress}
              onSelectAddress={setConfirmedAddress}
            />

            {/* Section 2: Custom Tailoring Measurements */}
            <CustomMeasurementsSection
              cartList={cartList}
              onMeasurementsChange={setCustomMeasurements}
            />

            {/* Section 3: Delivery Method */}
            <DeliveryMethodSection
              cartList={cartList}
              deliveryFee={deliveryFee}
            />

            {/* Section 4: Payment Method */}
            <PaymentMethodSection
              onSelectPaymentMethod={setSelectedPaymentMethodId}
              showToast={showToast}
            />
          </div>

          {/* RIGHT COLUMN: Order Summary Sidebar */}
          <OrderSummaryCard
            cartList={cartList}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            isSubmitting={isSubmitting}
            onPlaceOrder={handlePlaceOrder}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
