import style from "../../style/components/shopFilter.module.css";

const ShopFilter = ({
  minLimit = 0,
  maxLimit = 2500,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange,
  isMobileFilterOpen = false,
}) => {
  const handleResetPrice = () => {
    onPriceChange(minLimit, maxLimit);
  };

  const handleMinSliderChange = (e) => {
    const val = Math.min(Number(e.target.value), maxPrice);
    onPriceChange(val, maxPrice);
  };

  const handleMaxSliderChange = (e) => {
    const val = Math.max(Number(e.target.value), minPrice);
    onPriceChange(minPrice, val);
  };

  const handleMinInputChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onPriceChange(minLimit, maxPrice);
    } else {
      const num = Number(raw);
      if (!isNaN(num)) {
        onPriceChange(Math.min(num, maxPrice), maxPrice);
      }
    }
  };

  const handleMaxInputChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onPriceChange(minPrice, maxLimit);
    } else {
      const num = Number(raw);
      if (!isNaN(num)) {
        onPriceChange(minPrice, num);
      }
    }
  };

  const rangeSpan = maxLimit - minLimit;
  const minPercent =
    rangeSpan > 0
      ? Math.min(100, Math.max(0, ((minPrice - minLimit) / rangeSpan) * 100))
      : 0;
  const maxPercent =
    rangeSpan > 0
      ? Math.min(100, Math.max(0, ((maxPrice - minLimit) / rangeSpan) * 100))
      : 100;

  return (
    <aside
      className={`${style.filterSidebar} ${
        isMobileFilterOpen ? style.openMobile : ""
      }`}
    >
      <div className={style.priceFilterWidget}>
        <div className={style.priceHeader}>
          <span className={style.priceTitle}>PRICE</span>
          <button
            type="button"
            className={style.resetBtn}
            onClick={handleResetPrice}
          >
            RESET
          </button>
        </div>

        {/* Dual range slider */}
        <div className={style.sliderContainer}>
          <div className={style.sliderTrack}></div>
          <div
            className={style.sliderRange}
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          ></div>
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            value={minPrice}
            onChange={handleMinSliderChange}
            className={`${style.rangeInput} ${style.rangeInputLeft}`}
          />
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            value={maxPrice}
            onChange={handleMaxSliderChange}
            className={`${style.rangeInput} ${style.rangeInputRight}`}
          />
        </div>

        {/* Price min/max inputs */}
        <div className={style.priceInputsRow}>
          <div className={style.priceInputBox}>
            <span className={style.currencySymbol}>₹</span>
            <input
              type="number"
              value={minPrice}
              onChange={handleMinInputChange}
              className={style.numberInput}
            />
          </div>

          <span className={style.priceDash}>-</span>

          <div className={style.priceInputBox}>
            <span className={style.currencySymbol}>₹</span>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxInputChange}
              className={style.numberInput}
            />
          </div>
        </div>

        <div className={style.priceDivider}></div>
      </div>

      {/* Mobile-only sort dropdown */}
      <div className={style.mobileSort}>
        <h3>Sort</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange && onSortChange(e.target.value)}
          className={style.selectSort}
        >
          <option value="default">Default</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
};

export default ShopFilter;
