import { Link } from "react-router-dom";
import Card from "../common/Card";
import style from "../../style/components/shopProductGrid.module.css";

const ShopProductGrid = ({
  products = [],
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  return (
    <section className={style.productsSection}>
      <div className={style.productsGrid}>
        {products.length > 0 ? (
          products.map((item) => (
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
      </div>

      {hasMore && (
        <div className={style.loadMoreContainer}>
          <button
            type="button"
            className={style.loadMoreBtn}
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading more..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default ShopProductGrid;
