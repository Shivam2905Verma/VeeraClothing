import { useEffect, useState, useCallback } from "react";
import { getAllDashboardCustomers } from "../../service/customer.service";
import Toast from "../../../common/Toast";
import style from "../../style/page/customer.module.css";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");

  // Toast State
  const [toast, setToast] = useState({ message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ message, type });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (verifiedFilter !== "ALL") {
        params.is_verified = verifiedFilter === "VERIFIED";
      }

      const data = await getAllDashboardCustomers(params);
      if (data?.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      showToast(
        error?.response?.data?.message || "Failed to load customers from server.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, verifiedFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Helper to extract initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={style.customerPage}>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={4000}
      />

      {/* 1. Header Row */}
      <div className={style.headerRow}>
        <div className={style.titleArea}>
          <h1 className={style.pageTitle}>Customers</h1>
          <span className={style.countBadge}>{customers.length}</span>
        </div>
      </div>

      {/* 2. Toolbar & Filters Row */}
      <div className={style.toolbarRow}>
        <div className={style.toolbarLeft}>
          {/* Search Input */}
          <div className={style.filterInputWrapper}>
            <span className={style.filterIcon}>
              <i className="ri-search-line" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or ID..."
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

          {/* Verification Status Filter Pills */}
          <div className={style.filterPills}>
            <button
              type="button"
              className={`${style.pillBtn} ${
                verifiedFilter === "ALL" ? style.pillActive : ""
              }`}
              onClick={() => setVerifiedFilter("ALL")}
            >
              All
            </button>
            <button
              type="button"
              className={`${style.pillBtn} ${
                verifiedFilter === "VERIFIED" ? style.pillActive : ""
              }`}
              onClick={() => setVerifiedFilter("VERIFIED")}
            >
              Verified
            </button>
            <button
              type="button"
              className={`${style.pillBtn} ${
                verifiedFilter === "UNVERIFIED" ? style.pillActive : ""
              }`}
              onClick={() => setVerifiedFilter("UNVERIFIED")}
            >
              Unverified
            </button>
          </div>
        </div>
      </div>

      {/* 3. Data Table / Empty State */}
      {loading ? (
        <div className={style.loadingSpinner}>
          <i
            className="ri-loader-4-line ri-spin"
            style={{ fontSize: "1.75rem", color: "#6b7280" }}
          />
        </div>
      ) : customers.length === 0 ? (
        <div className={style.emptyContainer}>
          <div className={style.emptyIcon}>
            <i className="ri-user-unfollow-line" style={{ fontSize: "2.5rem" }} />
          </div>
          <h3 className={style.emptyTitle}>No Customers Found</h3>
          <p className={style.emptySubtitle}>
            {searchQuery
              ? `No customers match "${searchQuery}". Try a different keyword.`
              : "No customer accounts have registered yet."}
          </p>
        </div>
      ) : (
        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                {/* 1. Customer ID Column */}
                <th className={style.tableHeader}>
                  <span>Customer ID</span>
                </th>

                {/* 2. Name Column */}
                <th className={style.tableHeader}>
                  <span>Customer Name</span>
                </th>

                {/* 3. Email Column */}
                <th className={style.tableHeader}>
                  <span>Email</span>
                </th>

                {/* 4. Verification Status Column */}
                <th className={style.tableHeader}>
                  <span>Status</span>
                </th>

                {/* 5. Joined Date Column */}
                <th className={style.tableHeader}>
                  <span>Joined Date</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const isVerified = Boolean(customer.is_verified);
                const joinedDate = customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={customer.id} className={style.tableRow}>
                    {/* 1. Customer ID */}
                    <td className={style.idCell}>
                      <span className={style.idBadge}>
                        #USR-{String(customer.id).padStart(4, "0")}
                      </span>
                    </td>

                    {/* 2. Customer Name */}
                    <td className={style.customerCell}>
                      <div className={style.customerWrapper}>
                        <div className={style.avatar}>
                          <span>{getInitials(customer.name)}</span>
                        </div>
                        <span className={style.customerName}>
                          {customer.name || "Unnamed Customer"}
                        </span>
                      </div>
                    </td>

                    {/* 3. Email */}
                    <td className={style.emailCell}>
                      <div className={style.emailContent}>
                        <i className={`ri-mail-line ${style.emailIcon}`} />
                        <span>{customer.email || "—"}</span>
                      </div>
                    </td>

                    {/* 4. Status Badge */}
                    <td className={style.statusCell}>
                      <span
                        className={`${style.statusBadge} ${
                          isVerified ? style.badgeVerified : style.badgeUnverified
                        }`}
                      >
                        <i
                          className={
                            isVerified
                              ? "ri-checkbox-circle-fill"
                              : "ri-error-warning-fill"
                          }
                        />
                        <span>{isVerified ? "Verified" : "Unverified"}</span>
                      </span>
                    </td>

                    {/* 5. Joined Date */}
                    <td className={style.dateCell}>
                      <span>{joinedDate}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Footer */}
          <div className={style.tableFooter}>
            <span className={style.footerInfo}>
              Showing {customers.length} customers
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
