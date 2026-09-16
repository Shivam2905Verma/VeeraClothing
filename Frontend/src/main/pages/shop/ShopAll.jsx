import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import style from "../../style/pages/shopall.module.css";
import { getAllProducts } from "../../services/product.service";

const ShopAll = () => {
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("default");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        if (isMounted && products && products.products) {
          const data = products.products
            ?.filter((item) => (item.is_active === true || item.is_active === 1) && item.price <= maxPrice)
            ?.sort((a, b) => {
              if (sortBy === "low-to-high") return a.price - b.price;
              if (sortBy === "high-to-low") return b.price - a.price;
              return 0;
            });
          setProductsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [sortBy, maxPrice]);

  return (
    <div className={style.container}>
      <header className={style.header}>
        <h2>All Products</h2>
        <div className={style.sortbyDesktop}>
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
      >
        {isMobileFilterOpen ? "Close Filters" : "Filters & Sort"}
      </button>

      <div className={style.mainLayout}>
        {/* Sticky desktop sidebar / toggleable mobile drawer */}
        <aside
          className={`${style.filterSidebar} ${
            isMobileFilterOpen ? style.openMobile : ""
          }`}
        >
          <div className={style.filterGroup}>
            <h3>Max Price: ₹{maxPrice}</h3>
            <input
              type="range"
              min="300"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className={style.priceRange}
            />
          </div>

          <div className={style.mobileSort}>
            <h3>Sort</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={style.selectSort}
            >
              <option value="default">Default</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className={style.productsGrid}>
          {productsData.length > 0 ? (
            productsData.map((item) => (
              <Link
                key={item.id}
                to={`/shop/${item.id}`}
                className={style.productLink}
              >
                <Card
                  img={item.image_url}
                  name={item.name}
                  price={item.price}
                />
              </Link>
            ))
          ) : (
            <p className={style.emptyState}>No products match this filter.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopAll;
