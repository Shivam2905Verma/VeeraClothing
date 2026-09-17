import { Link } from "react-router-dom";
import style from "../../../style/components/productCard.module.css";

const ProductCard = ({
  product,
  onToggleStatus,
  onDelete,
}) => {
  if (!product) return null;

  return (
    <div
      className={`${style.productCard} ${
        !product.is_active ? style.inactiveCard : ""
      }`}
    >
      {/* Three Action Buttons: Edit, Active/Deactivate, Delete */}
      <div className={style.actionButtons}>
        {/* 1. Edit Button (Links to EditProduct page) */}
        <Link
          to={`/dashboard/products/edit/${product.id}`}
          className={`${style.btn} ${style.editBtn}`}
          title="Edit product"
        >
          <i className="ri-edit-line" />
          <span>Edit</span>
        </Link>

        {/* 2. Active / Deactive Toggle Button */}
        <button
          type="button"
          className={`${style.btn} ${
            product.is_active
              ? style.toggleBtnActive
              : style.toggleBtnInactive
          }`}
          onClick={() => onToggleStatus(product)}
          title={
            product.is_active
              ? "Click to deactivate product"
              : "Click to activate product"
          }
        >
          {product.is_active ? (
            <>
              <i className="ri-checkbox-circle-line" />
              <span>Active</span>
            </>
          ) : (
            <>
              <i className="ri-close-circle-line" />
              <span>Deactive</span>
            </>
          )}
        </button>

        {/* 3. Delete Button */}
        <button
          type="button"
          className={`${style.btn} ${style.deleteBtn}`}
          onClick={() => onDelete(product)}
          title="Delete product permanently"
        >
          <i className="ri-delete-bin-line" />
          <span>Delete</span>
        </button>
      </div>

      {/* Product Details (Name at Center) */}
      <div className={style.cardCenter}>
        <div className={style.nameRow}>
          <h2 className={style.productName}>{product.name}</h2>
          <span
            className={`${style.statusPill} ${
              product.is_active
                ? style.statusPillActive
                : style.statusPillInactive
            }`}
          >
            {product.is_active ? "Live" : "Disabled"}
          </span>
        </div>

        <div className={style.productMeta}>
          <span className={style.productPrice}>₹{product.price}</span>
          <span
            className={`${style.productStock} ${
              product.stock <= 0 ? style.stockOut : ""
            }`}
          >
            {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
          </span>
          {product.description && (
            <span className={style.productDesc}>
              {product.description}
            </span>
          )}
        </div>
      </div>

      {/* Product Image at Right */}
      <div className={style.cardRight}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={style.productImg}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/90?text=Product";
            }}
          />
        ) : (
          <div className={style.placeholderImg}>
            <i
              className="ri-image-line"
              style={{ fontSize: "1.5rem" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
