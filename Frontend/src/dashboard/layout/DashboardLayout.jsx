import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { brandDetail } from "../../common/brandDetail";
import style from "../style/layout/dashboardLayout.module.css";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      end: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      title: "Products",
      path: "/dashboard/products",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      title: "Orders",
      path: "/dashboard/orders",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
    },
  ];

  return (
    <div className={style.dashboardContainer}>
      {/* Top Header Bar */}
      <header className={style.topHeader}>
        <div className={style.headerLeft}>
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={style.mobileMenuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
          <div className={style.portalBadge}>Admin Panel</div>
        </div>

        {/* Center Brand Name */}
        <div className={style.headerCenter}>
          <Link to="/dashboard" className={style.brandTitle}>
            {brandDetail.brandName}
          </Link>
        </div>

        {/* Right Header Actions */}
        <div className={style.headerRight}>
          <Link to="/" className={style.visitStoreBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Live Store</span>
          </Link>
        </div>
      </header>

      {/* Main Body Area: Sidebar + Outlet */}
      <div className={style.bodyWrapper}>
        {/* Desktop Sidebar / Mobile Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            className={style.drawerBackdrop}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${style.sidebar} ${
            isMobileMenuOpen ? style.sidebarOpen : ""
          }`}
        >
          <div className={style.sidebarInner}>
            <div className={style.sidebarSectionLabel}>MAIN MENU</div>
            <nav className={style.navMenu}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `${style.navLink} ${isActive ? style.navLinkActive : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={style.navIcon}>{item.icon}</span>
                  <span className={style.navText}>{item.title}</span>
                </NavLink>
              ))}
            </nav>

            <div className={style.sidebarFooter}>
              <div className={style.adminInfo}>
                <div className={style.adminAvatar}>
                  {brandDetail.brandName?.charAt(0) || "A"}
                </div>
                <div className={style.adminDetails}>
                  <p className={style.adminName}>Admin</p>
                  <p className={style.adminEmail}>{brandDetail.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area (Changes only on page change) */}
        <main className={style.mainContent}>
          <div className={style.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

