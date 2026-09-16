import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import style from "../../style/pages/productdetail.module.css";
import { getProduct } from "../../services/product.service";
import { MainContext } from "../../context/MainContext";
import { useContext } from "react";
import { addToCart } from "../../services/cart.service";
import Toast from "../../../common/Toast.jsx";

const ProductDetail = () => {
  const { setCartItems } = useContext(MainContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantIndex]);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await getProduct(id);
        if (response?.success && response?.product && isMounted) {
          const fetchedProduct = response.product;
          setProduct(fetchedProduct);

          // Extract image URLs array from product_images or fallback to main image_url
          const images =
            fetchedProduct.images && fetchedProduct.images.length > 0
              ? fetchedProduct.images.map((img) => img.image_url)
              : [fetchedProduct.image_url];
          setActiveImage(images[0] || "");
        } else if (isMounted) {
          showToast(
            response?.message || "Product not found or unavailable.",
            "error",
          );
        }
      } catch (err) {
        console.error("fetchProduct:", err);
        if (isMounted) {
          showToast(
            "Failed to load product details. Please try again later.",
            "error",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.loadingState}>
          <div className={style.spinner} />
          <p>Loading piece details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={style.container}>
        <div className={style.notFound}>
          <h2>Product Not Found</h2>
          <p>
            The piece you are looking for is currently unavailable or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  // Current selected variant
  const currentVariant =
    product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex] || product.variants[0]
      : null;

  const currentVariantId = currentVariant?.id || null;
  const maxStock = Number(currentVariant?.stock || 0);
  const isOutOfStock = maxStock <= 0;
  const priceToDisplay = currentVariant?.price || product.price;

  // Image list
  const imageList =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image_url)
      : [product.image_url];

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setQuantity("");
      return;
    }
    const num = Number(val);
    if (!isNaN(num) && num >= 1) {
      if (maxStock > 0 && num > maxStock) {
        setQuantity(maxStock);
      } else {
        setQuantity(num);
      }
    }
  };

  const handleIncrement = () => {
    const current = typeof quantity === "number" ? quantity : 1;
    if (maxStock > 0 && current >= maxStock) return;
    setQuantity(current + 1);
  };

  const handleDecrement = () => {
    const current = typeof quantity === "number" ? quantity : 1;
    if (current <= 1) return;
    setQuantity(current - 1);
  };

  const handleBlur = () => {
    if (quantity === "" || Number(quantity) < 1) {
      setQuantity(1);
    }
  };

  async function handleAddToCart() {
    if (!currentVariantId) return;
    const finalQty =
      typeof quantity === "number" && quantity >= 1 ? quantity : 1;

    try {
      const res = await addToCart(currentVariantId, finalQty);
      if (res?.success) {
        setCartItems((prevItems) => {
          const currentQty = prevItems[currentVariantId]?.quantity || 0;
          return {
            ...prevItems,
            [currentVariantId]: {
              cartItemId: res.cartItemId,
              productId: id,
              variantId: currentVariant.id,
              quantity: currentQty + finalQty,
              price: currentVariant.price,
              name: product.name,
              color: currentVariant.color,
              image_url: product.image_url,
            },
          };
        });
        showToast("Added to your shopping bag!", "success");
      } else if (res?.message) {
        showToast(res.message, "error");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart";
      showToast(errorMessage, "error");
    }
  }

  return (
    <div className={style.container}>
      <Toast
        message={toast.message}
        type={toast.type}
        duration={5000}
        onClose={() => setToast({ message: "", type: "error" })}
      />
      <section className={style.mainSection}>
        {/* Gallery */}
        <div className={style.imageGallery}>
          <div className={style.thumbnailList}>
            {imageList.map((src, index) => (
              <button
                key={src || index}
                type="button"
                className={`${style.thumbnailButton} ${
                  activeImage === src ? style.activeThumbnail : ""
                }`}
                onClick={() => setActiveImage(src)}
              >
                <img src={src} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>

          <div className={style.mainImageContainer}>
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className={style.mainImage}
            />
          </div>
        </div>

        {/* Product Purchase & Details */}
        <div className={style.infoPanel}>
          <h1 className={style.productTitle}>{product.name}</h1>
          <p className={style.productDescription}>{product.description}</p>

          <div className={style.priceBlock}>
            <span className={style.price}>₹{priceToDisplay}</span>
            <span className={style.taxNotice}>Inclusive of all taxes</span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className={style.selectorGroup}>
              <label htmlFor="variant-select" className={style.label}>
                Select Option / Color
              </label>
              <select
                id="variant-select"
                value={selectedVariantIndex}
                onChange={(e) =>
                  setSelectedVariantIndex(Number(e.target.value))
                }
                className={style.variantSelect}
              >
                {product.variants.map((variant, index) => (
                  <option key={variant.id || index} value={index}>
                    {variant.color}{" "}
                    {Number(variant.stock) === 0 ? "(Out of Stock)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={style.actionRow}>
            <div className={style.quantityCounter}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isOutOfStock || quantity <= 1}
                className={style.qtyBtn}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={maxStock > 0 ? maxStock : undefined}
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                disabled={isOutOfStock}
                className={style.qtyInput}
                aria-label="Product quantity"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={
                  isOutOfStock || (maxStock > 0 && quantity >= maxStock)
                }
                className={style.qtyBtn}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={style.addToBagBtn}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Bag"}
            </button>
          </div>

          <div className={style.metaList}>
            <p className={style.deliveryText}>
              Estimated delivery <b>18 Sept - 23 Sept</b>
            </p>
            {product.extra_info
              ? product.extra_info
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <div key={item} className={style.infoBanner}>
                      {item}
                    </div>
                  ))
              : null}
          </div>
        </div>
      </section>

      {/* Accordion / Specifications Area */}
      <section className={style.specificationsSection}>
        <h2 className={style.specsTitle}>The Details</h2>
        <div className={style.specsGrid}>
          <div className={style.specsCol}>
            <h3 className={style.colHeader}>Highlights</h3>
            <ul className={style.bulletList}>
              {product.highlights
                ? product.highlights
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((item) => <li key={item}>{item}</li>)
                : null}
            </ul>
          </div>

          <div className={style.specsCol}>
            <h3 className={style.colHeader}>Composition</h3>
            {product.composition
              ? product.composition
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((c) => {
                    const parts = c.split(":");
                    return (
                      <p key={c} className={style.specLine}>
                        {parts.length > 1 ? (
                          <>
                            <strong>{parts[0].trim()}:</strong>{" "}
                            {parts.slice(1).join(":").trim()}
                          </>
                        ) : (
                          c
                        )}
                      </p>
                    );
                  })
              : null}

            {product.care && (
              <>
                <h3 className={`${style.colHeader} ${style.extraMarginTop}`}>
                  Washing Instructions
                </h3>
                <p className={style.specLine}>{product.care}</p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
