import { Link } from "react-router-dom";
import style from "../../../style/components/productTopBar.module.css";

const ProductTopBar = ({
  totalCount = 0,
  searchQuery = "",
  setSearchQuery,
}) => {
  return (
    <div className={style.topBar}>
      {/* Top Left: Title, Total Count Badge, Add Product Button */}
      <div className={style.topLeft}>
        <div className={style.titleGroup}>
          <h1 className={style.pageTitle}>Products</h1>
          <span className={style.totalBadge}>Total: {totalCount}</span>
        </div>
        <Link to="/dashboard/products/add" className={style.addProductBtn}>
          <i className="ri-add-line" style={{ fontSize: "1rem" }} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Top Right: Search Bar */}
      <div className={style.topRight}>
        <div className={style.searchContainer}>
          <span className={style.searchIcon}>
            <i className="ri-search-line" />
          </span>
          <input
            type="text"
            placeholder="Search products by name or price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={style.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              className={style.clearSearchBtn}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTopBar;
