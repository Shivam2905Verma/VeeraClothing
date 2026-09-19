import { useState, useEffect } from "react";
import { getPaymentMethods } from "../../services/checkout.service";
import style from "../../style/components/checkout/paymentMethod.module.css";

const PaymentMethodSection = ({ onSelectPaymentMethod, showToast }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch available payment methods from backend
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        const res = await getPaymentMethods();
        if (res?.success && Array.isArray(res.paymentMethods)) {
          setPaymentMethods(res.paymentMethods);
          if (res.paymentMethods.length > 0) {
            const defaultId = res.paymentMethods[0].id;
            setSelectedId(defaultId);
            if (onSelectPaymentMethod) {
              onSelectPaymentMethod(defaultId);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load payment methods:", error);
        showToast?.("Failed to load payment methods", "error");
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(id);
    }
  };

  const selectedPaymentMethodObj = paymentMethods.find(
    (pm) => pm.id === selectedId
  );

  return (
    <div className={style.sectionBlock}>
      <div className={style.sectionHeader}>
        <div className={style.sectionTitleRow}>
          <div className={style.statusCheckIcon}>
            <i className="ri-check-line" />
          </div>
          <div>
            <h2 className={style.sectionTitle}>Payment Method</h2>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0", color: "#666", fontSize: "0.88rem" }}>
          Loading payment options...
        </div>
      ) : (
        <div className={style.paymentMethodsList}>
          {paymentMethods.map((pm) => {
            const isSelected = selectedId === pm.id;
            let iconClass = "ri-bank-card-line";
            if (pm.name.toLowerCase().includes("paypal")) {
              iconClass = "ri-paypal-fill";
            } else if (pm.name.toLowerCase().includes("cash")) {
              iconClass = "ri-money-dollar-circle-line";
            } else if (pm.name.toLowerCase().includes("upi")) {
              iconClass = "ri-qr-code-line";
            }

            return (
              <label
                key={pm.id}
                className={`${style.paymentCard} ${
                  isSelected ? style.paymentCardSelected : ""
                }`}
                onClick={() => handleSelect(pm.id)}
              >
                <div className={style.paymentLeft}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={isSelected}
                    onChange={() => handleSelect(pm.id)}
                    className={style.paymentRadio}
                  />
                  <span className={style.paymentName}>{pm.name}</span>
                </div>
                <i className={`${iconClass} ${style.paymentIcon}`} />
              </label>
            );
          })}
        </div>
      )}

      <p className={style.paymentNotice}>
        When you place your order, you'll be securely confirmed using{" "}
        <strong>
          {selectedPaymentMethodObj?.name || "selected payment method"}
        </strong>.
      </p>
    </div>
  );
};

export default PaymentMethodSection;
