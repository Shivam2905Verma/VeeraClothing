import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "../../style/components/searchOverlay.module.css";
import { getAllCategories } from "../../services/category.service";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch real categories from DB
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategories();
        if (isMounted && res && res.categories) {
          setCategoriesList(res.categories);
        }
      } catch (err) {
        console.error("Failed to load categories in search overlay:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

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
      setActiveCategoryId("all");
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
      navigate(`/shopall?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/shopall?search=${encodeURIComponent(categoryName)}`);
    onClose();
  };

  // Filter categories based on search query if user is typing or active tab
  const filteredCategories = categoriesList.filter((cat) => {
    const matchesSearch = cat.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    const matchesTab =
      activeCategoryId === "all" ||
      cat.id === activeCategoryId ||
      cat.name === activeCategoryId;
    return matchesSearch && matchesTab;
  });

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

        <form onSubmit={handleSearchSubmit} className={style.modalSearchForm}>
          <div className={style.modalSearchInputWrapper}>
            <i className={`ri-search-line ${style.modalSearchIcon}`}></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.modalSearchInput}
            />
          </div>
        </form>

        {/* Categories Tabs dynamically loaded from DB for Women's Store */}
        <div className={style.modalTabsWrapper}>
          <div className={style.modalTabs}>
            <button
              type="button"
              className={`${style.modalTabBtn} ${
                activeCategoryId === "all" ? style.modalTabBtnActive : ""
              }`}
              onClick={() => setActiveCategoryId("all")}
            >
              All
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${style.modalTabBtn} ${
                  activeCategoryId === cat.id ? style.modalTabBtnActive : ""
                }`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Categories from DB */}
        <div className={style.categoryListContainer}>
          {loading ? (
            <div className={style.categoryLoading}>Loading categories...</div>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={style.categoryItemWrapper}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <div className={style.categoryRow}>
                  <span className={style.categoryName}>{cat.name}</span>
                  <i
                    className={`ri-arrow-right-s-line ${style.categoryChevron}`}
                  ></i>
                </div>
              </div>
            ))
          ) : (
            <div className={style.emptyCategories}>
              {searchQuery
                ? `No categories matching "${searchQuery}"`
                : "No categories available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
