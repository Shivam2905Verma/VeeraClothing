import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import style from "../../style/pages/cart.module.css";
import { MainContext } from "../../context/MainContext";
import { updateCart } from "../../services/cart.service";
import Toast from "../../components/common/Toast";

const Cart = () => {
  const { cartItems, setCartItems } = useContext(MainContext);
  const [errorMsg, setErrorMsg] = useState("");

  const itemsList = Object.values(cartItems);

  async function updateQuantity(cartItemId, variantId, delta) {
    const target = cartItems[variantId];
    if (!target) return;
    const nextQty = target.quantity + delta;

    try {
      const res = await updateCart(cartItemId, nextQty);
      if (res.success) {
        if (nextQty <= 0) {
          setCartItems((prev) => {
            const copy = { ...prev };
            delete copy[variantId];
            return copy;
          });
        } else {
          setCartItems((prev) => ({
            ...prev,
            [variantId]: { ...prev[variantId], quantity: nextQty },
          }));
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update item in cart";
      setErrorMsg(errorMessage);
      console.log("Error while updating item in cart", errorMessage);
    }
  }

  const removeItem = (variantId) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      delete copy[variantId];
      return copy;
    });
  };

  const subtotal = itemsList.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const delivery = subtotal > 999 || itemsList.length === 0 ? 0 : 99;
  const total = subtotal + delivery;

  return (
    <div className={style.container}>
      <Toast
        message={errorMsg}
        type="error"
        duration={5000}
        onClose={() => setErrorMsg("")}
      />
      {/* Page Header */}
      <div className={style.header}>
        <h1 className={style.pageTitle}>Shopping Bag</h1>
        <Link to="/shop" className={style.continueShopping}>
          Continue Shopping
        </Link>
      </div>

      {itemsList.length === 0 ? (
        <div className={style.emptyContainer}>
          <p>Your shopping bag is empty.</p>
          <Link to="/shopall" className={style.shopNowBtn}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div className={style.contentGrid}>
          {/* Items Column */}
          <section className={style.itemsSection}>
            <div className={style.tableBanner}>
              <span>Import duties and taxes are included</span>
              <i className="ri-information-line" />
            </div>

            <div className={style.itemList}>
              {itemsList.map((item) => (
                <article key={item.variantId} className={style.cartCard}>
                  {/* Thumbnail */}
                  <Link
                    to={`/shop/${item.productId}`}
                    className={style.imageLink}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className={style.productImage}
                    />
                  </Link>

                  {/* Title & Farfetch-style info */}
                  <div className={style.metaColumn}>
                    <span className={style.badge}>New Season</span>
                    <Link
                      to={`/shop/${item.productId}`}
                      className={style.productName}
                    >
                      {item.name}
                    </Link>
                    <p className={style.itemDetailText}>Color: {item.color}</p>
                    <p className={style.idNotice}>ITEM ID: {item.variantId}</p>
                  </div>

                  {/* Price */}
                  <div className={style.priceColumn}>
                    <span className={style.unitPrice}>₹{item.price}</span>
                    <span className={style.priceNotice}>Taxes included</span>
                  </div>

                  {/* Variant & Stepper */}
                  <div className={style.actionsColumn}>
                    <button
                      type="button"
                      className={style.removeBtn}
                      onClick={() => removeItem(item.variantId)}
                      aria-label="Remove item"
                    >
                      <i className="ri-close-line" />
                    </button>

                    <div className={style.quantityControl}>
                      <span className={style.qtyLabel}>Quantity:</span>
                      <div className={style.counter}>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.variantId, -1)
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.variantId, 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Sticky Summary Column */}
          <aside className={style.summarySticky}>
            <div className={style.summaryCard}>
              <h2 className={style.summaryTitle}>Summary</h2>

              <div className={style.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className={style.summaryRow}>
                <span>Delivery</span>
                <span>
                  {delivery === 0 ? "Free" : `₹${delivery.toFixed(2)}`}
                </span>
              </div>

              <div className={style.summaryDivider} />

              <div className={style.totalRow}>
                <div>
                  <span className={style.totalLabel}>Total</span>
                  <span className={style.totalSubNotice}>Taxes included</span>
                </div>
                <span className={style.totalPrice}>₹{total.toFixed(2)}</span>
              </div>

              <button type="button" className={style.checkoutBtn}>
                Go To Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
