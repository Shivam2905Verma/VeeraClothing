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
      icon: <i className="ri-dashboard-line" style={{ fontSize: "1.15rem" }} />,
    },
    {
      title: "Products",
      path: "/dashboard/products",
      icon: <i className="ri-shopping-bag-3-line" style={{ fontSize: "1.15rem" }} />,
    },
    {
      title: "Orders",
      path: "/dashboard/orders",
      icon: <i className="ri-file-list-3-line" style={{ fontSize: "1.15rem" }} />,
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
              <i className="ri-close-line" style={{ fontSize: "1.3rem" }} />
            ) : (
              <i className="ri-menu-line" style={{ fontSize: "1.3rem" }} />
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
            <i className="ri-external-link-line" />
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

