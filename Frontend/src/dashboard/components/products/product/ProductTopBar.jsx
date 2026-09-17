import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import style from "../../../style/components/productTopBar.module.css";

const ProductTopBar = ({
  totalCount = 0,
  searchQuery = "",
  setSearchQuery,
  statusFilter = "ALL",
  setStatusFilter,
  onRefresh,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [filterDropdownSearch, setFilterDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowStatusMenu(false);
      }
    };
    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusMenu]);

  const filterOptions = [
    { label: "All Products", value: "ALL" },
    { label: "Live (Active)", value: "ACTIVE" },
    { label: "Disabled", value: "INACTIVE" },
    { label: "In Stock", value: "IN_STOCK" },
    { label: "Out of Stock", value: "OUT_OF_STOCK" },
  ];

  const filteredOptions = filterOptions.filter((opt) =>
    opt.label.toLowerCase().includes(filterDropdownSearch.toLowerCase()),
  );

  return (
    <div>
      {/* 1. Page Header Row: Title on Left, Add Product Button on Right */}
      <div className={style.headerRow}>
        <div className={style.titleArea}>
          <h1 className={style.pageTitle}>Products</h1>
          <span className={style.countBadge}>{totalCount}</span>
        </div>

        <Link to="/dashboard/products/add" className={style.primaryActionBtn}>
          <i className="ri-add-line" style={{ fontSize: "1rem" }} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* 2. Filter & Toolbar Row (Matches reference screenshot) */}
      <div className={style.toolbarRow}>
        <div className={style.toolbarLeft}>
          {/* Search Input */}
          <div className={style.filterInputWrapper}>
            <span className={style.filterIcon}>
              <i className="ri-search-line" />
            </span>
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.filterInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={style.clearBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Clear filter"
              >
                <i className="ri-close-line" />
              </button>
            )}
          </div>

          {/* Status Dropdown Trigger Pill */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              type="button"
              className={`${style.filterPill} ${
                statusFilter !== "ALL" ? style.filterPillActive : ""
              }`}
              onClick={() => setShowStatusMenu(!showStatusMenu)}
            >
              <i className="ri-filter-3-line" style={{ fontSize: "0.85rem" }} />
              <span>
                {statusFilter === "ALL"
                  ? "State"
                  : statusFilter === "ACTIVE"
                  ? "Live"
                  : statusFilter === "INACTIVE"
                  ? "Disabled"
                  : statusFilter === "IN_STOCK"
                  ? "In Stock"
                  : "Out of Stock"}
              </span>
              <i
                className="ri-arrow-down-s-line"
                style={{ fontSize: "0.85rem", opacity: 0.6 }}
              />
            </button>

            {/* Floating Popover matching the screenshot */}
            {showStatusMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  zIndex: 60,
                  minWidth: "200px",
                  padding: "6px",
                }}
              >
                {/* Popover inner search */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    borderBottom: "1px solid #f3f4f6",
                    marginBottom: "4px",
                  }}
                >
                  <i
                    className="ri-search-line"
                    style={{ fontSize: "0.8rem", color: "#9ca3af" }}
                  />
                  <input
                    type="text"
                    placeholder="Search State"
                    value={filterDropdownSearch}
                    onChange={(e) => setFilterDropdownSearch(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: "0.8rem",
                      width: "100%",
                      color: "#111827",
                      background: "transparent",
                    }}
                    autoFocus
                  />
                </div>

                {/* List of options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {filteredOptions.map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 8px",
                          fontSize: "0.825rem",
                          border: "none",
                          borderRadius: "4px",
                          background: isSelected ? "#f3f4f6" : "transparent",
                          color: "#111827",
                          fontWeight: isSelected ? "600" : "400",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onClick={() => {
                          if (setStatusFilter) setStatusFilter(opt.value);
                          setShowStatusMenu(false);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{
                            cursor: "pointer",
                            accentColor: "#111827",
                          }}
                        />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={style.iconOnlyPill}
            title="Saved Views"
          >
            <i className="ri-bookmark-line" style={{ fontSize: "0.9rem" }} />
          </button>
        </div>

        {/* Toolbar Right */}
        <div className={style.toolbarRight}>
          <button
            type="button"
            className={style.viewBtn}
            onClick={onRefresh}
            title="Refresh Data"
          >
            <i className="ri-refresh-line" style={{ fontSize: "0.95rem" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTopBar;
