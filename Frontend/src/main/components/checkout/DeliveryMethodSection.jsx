import { useMemo } from "react";
import style from "../../style/components/checkout/deliveryMethod.module.css";

const DeliveryMethodSection = ({ cartList = [], deliveryFee = 0 }) => {
  // Estimated Delivery Date Range (4 - 7 days from now)
  const deliveryDates = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 4);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);

    const format = (d) =>
      d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `${format(start)} - ${format(end)}`;
  }, []);

  return (
    <div className={style.sectionBlock}>
      <div className={style.sectionHeader}>
        <div className={style.sectionTitleRow}>
          <div className={style.statusCheckIcon}>
            <i className="ri-check-line" />
          </div>
          <div>
            <h2 className={style.sectionTitle}>Delivery Method</h2>
          </div>
        </div>
      </div>

      <div className={style.deliveryOptionCard}>
        <div className={style.deliveryHeader}>
          <span className={style.deliveryName}>Standard Delivery</span>
          <span className={style.deliveryPrice}>
            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}.00`}
          </span>
        </div>

        <div className={style.deliveryItemsRow}>
          {cartList.map((item) => (
            <div key={item.variantId} className={style.deliveryItemSnippet}>
              <img
                src={item.image_url}
                alt={item.name}
                className={style.deliveryThumb}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/50?text=VC";
                }}
              />
              <span className={style.deliveryEstimate}>
                Estimated delivery between <strong>{deliveryDates}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryMethodSection;
