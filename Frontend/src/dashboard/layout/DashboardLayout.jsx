import { useState, useMemo } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { brandDetail } from "../../common/brandDetail";
import style from "../style/layout/dashboardLayout.module.css";

const DashboardLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Grouped Navigation Structure matching reference
  const navSections = [
    {
      items: [
        {
          title: "Insights",
          path: "/dashboard",
          end: true,
          icon: <i className="ri-pie-chart-line" />,
        },
      ],
    },
    {
      sectionTitle: "Catalog",
      items: [
        {
          title: "Products",
          path: "/dashboard/products",
          icon: <i className="ri-shopping-bag-3-line" />,
        },
      ],
    },
    {
      sectionTitle: "Sales",
      items: [
        {
          title: "Orders",
          path: "/dashboard/orders",
          icon: <i className="ri-file-list-3-line" />,
        },
      ],
    },
    {
      sectionTitle: "Customers",
      items: [
        {
          title: "Customers",
          path: "/dashboard/customers",
          icon: <i className="ri-user-line" />,
          disabled: true,
        },
      ],
    },
    {
      sectionTitle: "Marketing",
      items: [
        {
          title: "Discounts & Offers",
          path: "/dashboard/marketing",
          icon: <i className="ri-percent-line" />,
          disabled: true,
        },
      ],
    },
  ];

  // Administration section at bottom
  const adminSections = [
    {
      title: "Settings",
      path: "/dashboard/settings",
      icon: <i className="ri-settings-3-line" />,
      disabled: true,
    },
    {
      title: "System",
      path: "/dashboard/system",
      icon: <i className="ri-terminal-box-line" />,
      disabled: true,
    },
  ];

  // Dynamic breadcrumb generation based on pathname
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    if (path === "/dashboard") {
      return ["Insights", "Overview"];
    }
    if (path.startsWith("/dashboard/products/add")) {
      return ["Catalog", "Products", "Add Product"];
    }
    if (path.startsWith("/dashboard/products/edit")) {
      return ["Catalog", "Products", "Edit Product"];
    }
    if (path.startsWith("/dashboard/products")) {
      return ["Catalog", "Products"];
    }
    if (path.startsWith("/dashboard/orders")) {
      return ["Sales", "Orders"];
    }
    return ["Dashboard"];
  }, [location.pathname]);

  return (
    <div className={style.dashboardContainer}>
      {/* Left Sidebar */}
      <aside
        className={`${style.sidebar} ${
          isSidebarCollapsed ? style.sidebarCollapsed : ""
        } ${isMobileMenuOpen ? style.sidebarMobileOpen : ""}`}
      >
        <div className={style.sidebarHeader}>
          <div className={style.brandTile}>
            {brandDetail.brandName
              ? brandDetail.brandName.slice(0, 2).toUpperCase()
              : "VC"}
          </div>
          <div className={style.brandInfo}>
            <span className={style.brandName}>{brandDetail.brandName}</span>
            <span className={style.brandSubtitle}>Admin Portal</span>
          </div>
        </div>

        <div className={style.sidebarContent}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className={style.navGroup}>
              {section.sectionTitle && (
                <div className={style.groupHeader}>
                  <span>{section.sectionTitle}</span>
                  <i className="ri-arrow-down-s-line" style={{ fontSize: "0.85rem" }} />
                </div>
              )}
              <div className={style.groupItems}>
                {section.items.map((item) =>
                  item.disabled ? (
                    <div
                      key={item.path}
                      className={`${style.navItem} ${style.navItemDisabled}`}
                      title="Coming soon"
                    >
                      <span className={style.navIcon}>{item.icon}</span>
                      <span className={style.navLabel}>{item.title}</span>
                    </div>
                  ) : (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `${style.navItem} ${
                          isActive ? style.navItemActive : ""
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className={style.navIcon}>{item.icon}</span>
                      <span className={style.navLabel}>{item.title}</span>
                    </NavLink>
                  ),
                )}
              </div>
            </div>
          ))}

          {/* Administration section */}
          <div className={style.adminSectionWrapper}>
            <div className={style.adminSectionTitle}>Administration</div>
            <div className={style.groupItems}>
              {adminSections.map((item) => (
                <div
                  key={item.path}
                  className={`${style.navItem} ${style.navItemDisabled}`}
                >
                  <span className={style.navIcon}>{item.icon}</span>
                  <span className={style.navLabel}>{item.title}</span>
                  <i
                    className="ri-arrow-right-s-line"
                    style={{ marginLeft: "auto", fontSize: "0.85rem", opacity: 0.5 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Tile at Bottom of Sidebar */}
        <div className={style.sidebarFooter}>
          <div className={style.userProfileTile}>
            <div className={style.userAvatar}>
              {brandDetail.brandName ? brandDetail.brandName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className={style.userInfo}>
              <span className={style.userName}>Admin</span>
              <span className={style.userRole}>Store Manager</span>
            </div>
            <div className={style.userChevron}>
              <i className="ri-expand-up-down-line" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className={style.backdrop}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area with Top Breadcrumb Bar */}
      <div className={style.mainWrapper}>
        {/* Top Breadcrumb & Actions Bar */}
        <header className={style.topBar}>
          <div className={style.topBarLeft}>
            <button
              type="button"
              className={style.toggleSidebarBtn}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              title="Toggle Sidebar"
            >
              <i className="ri-layout-left-line" style={{ fontSize: "1.15rem" }} />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className={style.breadcrumbNav}>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className={style.breadcrumbItem}>
                  {idx > 0 && (
                    <span className={style.breadcrumbSeparator}>
                      <i className="ri-arrow-right-s-line" />
                    </span>
                  )}
                  <span
                    className={
                      idx === breadcrumbs.length - 1
                        ? style.breadcrumbCurrent
                        : style.breadcrumbParent
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className={style.topBarRight}>
            <Link
              to="/"
              className={style.storeLink}
              title="View Live Store"
              target="_blank"
            >
              <i className="ri-external-link-line" />
              <span>Live Store</span>
            </Link>

            <button
              type="button"
              className={style.iconBtn}
              title="Notifications"
            >
              <i className="ri-notification-3-line" />
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className={style.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
