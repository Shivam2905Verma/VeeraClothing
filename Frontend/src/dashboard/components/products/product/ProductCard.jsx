import { Link } from "react-router-dom";
import style from "../../../style/components/productCard.module.css";

const ProductCard = ({
  product,
  onToggleStatus,
  onDelete,
}) => {
  if (!product) return null;

  // Format currency
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(product.price || 0);

  return (
    <tr
      className={`${style.tableRow} ${
        !product.is_active ? style.rowInactive : ""
      }`}
    >
      {/* 1. Product Column: Thumbnail + Title + ID */}
      <td className={style.productCell}>
        <div className={style.productInfoWrapper}>
          <div className={style.thumbnailWrapper}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className={style.productThumb}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/40?text=P";
                }}
              />
            ) : (
              <div className={style.thumbPlaceholder}>
                <i className="ri-image-line" />
              </div>
            )}
          </div>

          <div className={style.productDetails}>
            <Link
              to={`/dashboard/products/edit/${product.id}`}
              className={style.productNameLink}
            >
              {product.name}
            </Link>
            <span className={style.productId}>
              PRD-{String(product.id).padStart(4, "0")}
            </span>
          </div>
        </div>
      </td>

      {/* 3. Status Column */}
      <td className={style.statusCell}>
        <span
          className={`${style.statusBadge} ${
            product.is_active ? style.statusActive : style.statusInactive
          }`}
        >
          <span className={style.statusDot} />
          {product.is_active ? "Live" : "Disabled"}
        </span>
      </td>

      {/* 4. Category Column */}
      <td className={style.categoryCell}>
        <span className={style.categoryTag}>
          {product.category?.name || product.category_name || "General"}
        </span>
      </td>

      {/* 5. Price Column */}
      <td className={style.priceCell}>
        <span className={style.priceValue}>{formattedPrice}</span>
      </td>

      {/* 6. Actions Column */}
      <td className={style.actionsCell}>
        <div className={style.actionButtons}>
          {/* Edit */}
          <Link
            to={`/dashboard/products/edit/${product.id}`}
            className={style.actionIconBtn}
            title="Edit Product"
          >
            <i className="ri-edit-line" />
          </Link>

          {/* Toggle Live / Disabled */}
          <button
            type="button"
            className={`${style.actionIconBtn} ${
              product.is_active
                ? style.activeToggleBtn
                : style.inactiveToggleBtn
            }`}
            onClick={() => onToggleStatus(product)}
            title={
              product.is_active ? "Deactivate product" : "Activate product"
            }
          >
            {product.is_active ? (
              <i className="ri-eye-line" />
            ) : (
              <i className="ri-eye-off-line" />
            )}
          </button>

          {/* Delete */}
          <button
            type="button"
            className={`${style.actionIconBtn} ${style.deleteActionBtn}`}
            onClick={() => onDelete(product)}
            title="Delete Product"
          >
            <i className="ri-delete-bin-line" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductCard;
