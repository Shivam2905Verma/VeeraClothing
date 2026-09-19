import style from "../../style/components/shopHeader.module.css";

const ShopHeader = ({
  title = "All Products",
  sortBy,
  onSortChange,
  isMobileFilterOpen,
  onToggleMobileFilter,
}) => {
  const handleSortSelect = (e) => {
    if (onSortChange) {
      onSortChange(e.target.value);
    }
  };

  const handleToggle = () => {
    if (onToggleMobileFilter) {
      onToggleMobileFilter(!isMobileFilterOpen);
    }
  };

  return (
    <>
      <header className={style.header}>
        <h2 className={style.title}>{title}</h2>
        <div className={style.sortbyDesktop}>
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={handleSortSelect}
            className={style.selectSort}
          >
            <option value="default">Default</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>
      </header>

      {/* Mobile filter toggle button */}
      <button
        type="button"
        className={style.mobileFilterToggle}
        onClick={handleToggle}
      >
        {isMobileFilterOpen ? "Close Filters" : "Filters & Sort"}
      </button>
    </>
  );
};

export default ShopHeader;
