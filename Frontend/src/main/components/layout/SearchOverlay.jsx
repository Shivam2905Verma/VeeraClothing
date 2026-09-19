import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "../../style/components/searchOverlay.module.css";
import { getAllCategories } from "../../services/category.service";
import { searchProducts } from "../../services/product.service";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch real categories from DB
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await getAllCategories();
        if (isMounted && res && res.categories) {
          setCategoriesList(res.categories);
        }
      } catch (err) {
        console.error("Failed to load categories in search overlay:", err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live search products with debounce when user types
  useEffect(() => {
    let isMounted = true;
    const query = searchQuery.trim();

    if (!query) {
      setSuggestedProducts([]);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await searchProducts(query);
        if (isMounted && res && res.products) {
          setSuggestedProducts(res.products);
        }
      } catch (err) {
        console.error("Failed to search products:", err);
        if (isMounted) setSuggestedProducts([]);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  // Handle auto-focus and overflow lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "auto";
      setSearchQuery("");
      setSuggestedProducts([]);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shopall?query=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleCategoryClick = (cat) => {
    const catName = typeof cat === "string" ? cat : cat?.name;
    const catId = typeof cat === "object" ? cat?.id : undefined;

    if (catId) {
      navigate(
        `/shopall?category=${encodeURIComponent(catName)}&categoryId=${catId}`
      );
    } else {
      navigate(`/shopall?category=${encodeURIComponent(catName)}`);
    }
    onClose();
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/${productId}`);
    onClose();
  };

  return (
    <div
      className={`${style.searchOverlayBackdrop} ${
        isOpen ? style.searchOverlayOpen : ""
      }`}
      onClick={onClose}
    >
      <div
        className={style.searchModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={style.searchModalHeader}>
          <div className={style.searchBrandTitle}>VEERA CLOTHING</div>
          <button
            type="button"
            className={style.searchCloseBtn}
            onClick={onClose}
            aria-label="Close search"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className={style.modalSearchForm}>
          <div className={style.modalSearchInputWrapper}>
            <i className={`ri-search-line ${style.modalSearchIcon}`}></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for product, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.modalSearchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={style.clearInputBtn}
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear text"
              >
                <i className="ri-close-circle-fill"></i>
              </button>
            )}
          </div>
        </form>

        <div className={style.resultsContainer}>
          {searchQuery.trim() ? (
            /* Live Search Results (Small Product Cards) */
            <div className={style.productResultsSection}>
              <div className={style.sectionHeader}>
                <span className={style.sectionTitle}>
                  {loadingProducts ? "Searching..." : "Suggested Products"}
                </span>
                {suggestedProducts.length > 0 && (
                  <button
                    type="button"
                    className={style.viewAllTextBtn}
                    onClick={handleSearchSubmit}
                  >
                    View all results
                  </button>
                )}
              </div>

              {loadingProducts ? (
                <div className={style.loadingState}>
                  <i className="ri-loader-4-line ri-spin"></i> Searching products...
                </div>
              ) : suggestedProducts.length > 0 ? (
                <div className={style.productsGrid}>
                  {suggestedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className={style.productSmallCard}
                      onClick={() => handleProductClick(prod.id)}
                    >
                      <div className={style.productImgWrapper}>
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className={style.productImg}
                        />
                      </div>
                      <div className={style.productInfo}>
                        <h4 className={style.productName}>{prod.name}</h4>
                        <p className={style.productPrice}>₹{prod.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={style.emptyState}>
                  <p>No products found for "{searchQuery}"</p>
                  <button
                    type="button"
                    className={style.searchAnywayBtn}
                    onClick={handleSearchSubmit}
                  >
                    Search in all products
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Categories Only View */
            <div className={style.categoriesSection}>
              <div className={style.sectionTitle}>Categories</div>
              {loadingCategories ? (
                <div className={style.loadingState}>Loading categories...</div>
              ) : categoriesList.length > 0 ? (
                <div className={style.categoriesGrid}>
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.id}
                      className={style.categoryCard}
                      onClick={() => handleCategoryClick(cat)}
                    >
                      <span className={style.categoryName}>{cat.name}</span>
                      <i className={`ri-arrow-right-line ${style.categoryArrow}`}></i>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={style.emptyState}>No categories available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
