import { useEffect } from "react";
import { Link } from "react-router-dom";
import style from "../../style/components/mobileMenuDrawer.module.css";

const MobileMenuDrawer = ({
  isOpen,
  onClose,
  user,
  cartCount = 0,
  onLogoutClick,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Right overlay backdrop to click and close */}
      <div
        className={`${style.overlay} ${isOpen ? style.overlayOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Menubar from Left */}
      <div
        className={`${style.drawer} ${isOpen ? style.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Top Banner Image (Rectangular full width) */}
        <div className={style.bannerContainer}>
          <img
            src="/c1.jpg"
            alt="Veera Clothing Collection"
            className={style.bannerImage}
            onError={(e) => {
              e.target.src = "/i1.webp";
            }}
          />
          <div className={style.bannerOverlay}>
            <span className={style.bannerBrand}>VEERA CLOTHING</span>
            <span className={style.bannerSubtext}>Modern & Traditional Wear</span>
          </div>
          {/* Close button on the drawer */}
          <button
            type="button"
            className={style.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={style.navSection}>
          <Link to="/" className={style.navItem} onClick={onClose}>
            <i className="ri-home-4-line"></i>
            <span>Home</span>
          </Link>
          <Link to="/shopall" className={style.navItem} onClick={onClose}>
            <i className="ri-store-2-line"></i>
            <span>Shop All</span>
          </Link>
          <Link to="/aboutus" className={style.navItem} onClick={onClose}>
            <i className="ri-information-line"></i>
            <span>About Us</span>
          </Link>
          <Link to="/contactus" className={style.navItem} onClick={onClose}>
            <i className="ri-customer-service-2-line"></i>
            <span>Contact Us</span>
          </Link>

          <div className={style.divider}></div>

          <Link to="/cart" className={style.navItem} onClick={onClose}>
            <i className="ri-handbag-line"></i>
            <span>My Cart</span>
            {cartCount > 0 && (
              <span className={style.navBadge}>{cartCount}</span>
            )}
          </Link>
        </nav>

        {/* Bottom Section with User Name & Logout */}
        <div className={style.bottomSection}>
          {user ? (
            <>
              <div className={style.userInfo}>
                <div className={style.userAvatar}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className={style.userDetails}>
                  <div className={style.userName}>{user.name}</div>
                  {user.email && (
                    <div className={style.userEmail}>{user.email}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                className={style.logoutBtn}
                onClick={() => {
                  onClose();
                  onLogoutClick();
                }}
              >
                <i className="ri-logout-box-r-line"></i>
                <span>Logout ({user.name})</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={style.loginBtn}
              onClick={onClose}
            >
              <i className="ri-user-line"></i>
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenuDrawer;
