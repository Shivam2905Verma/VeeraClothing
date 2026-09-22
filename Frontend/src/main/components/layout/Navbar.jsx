import style from "../../style/components/navbar.module.css";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { MainContext } from "../../context/MainContext";
import { logoutUser } from "../../services/auth.service";
import ConfirmModal from "../../../common/ConfirmModal";
import SearchOverlay from "./SearchOverlay";
import MobileMenuDrawer from "./MobileMenuDrawer";

const Navbar = () => {
  const { cartItems, user, setUser, setCartItems } = useContext(MainContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setUser(null);
      setCartItems({});
      setLogoutModalOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const totalCartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
    : Object.values(cartItems || {}).reduce(
        (acc, item) => acc + (Number(item?.quantity) || 0),
        0,
      );

  return (
    <>
      <div className={style.top}>
        <div className={style.topleft}>
          <span
            className={`${style.menubar} ${style.mobileonly}`}
            onClick={() => setIsMenuOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Open Navigation Menu"
          >
            <i className="ri-menu-line"></i>
          </span>
          {user ? (
            <span className={style.login + " " + style.computeronly}>
              <i className="ri-user-line"></i> Hi {user.name}!
            </span>
          ) : (
            <Link
              to="/login"
              className={style.login + " " + style.computeronly}
            >
              <i className="ri-user-line"></i> Login / Register
            </Link>
          )}
        </div>
        <div className={style.topcenter}>VEERA CLOTHING</div>
        <div className={style.topright}>
          <button
            type="button"
            className={style.mobileSearchBtn + " " + style.mobileonly}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
          >
            <i className="ri-search-line"></i>
          </button>
          <Link to="/cart" className={style.cart}>
            <i className="ri-handbag-line"></i>
            <div className={style.cartCount}>{totalCartCount}</div>
          </Link>

          {user && (
            <button
              type="button"
              className={style.logoutBtn + " " + style.computeronly}
              onClick={() => setLogoutModalOpen(true)}
              title="Logout"
            >
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      <div className={style.linkcontainer}>
        <div className={style.navLinks}>
          <Link to="/" className={style.home}>
            Home
          </Link>
          <Link to="/shopall" className={style.shopall}>
            Shop All
          </Link>
          <Link to="/aboutus" className={style.aboutus}>
            About Us
          </Link>
          <Link to="/contactus" className={style.contactus}>
            Contact Us
          </Link>
        </div>

        <div
          className={style.searchBox}
          onClick={() => setIsSearchOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsSearchOpen(true);
            }
          }}
        >
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="search item"
            readOnly
            className={style.searchInput}
          />
        </div>
      </div>

      {/* Slide-in Navigation Menubar Drawer */}
      <MobileMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        cartCount={totalCartCount}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      {/* Standalone Full-Screen Search Overlay with Real DB Categories */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => {
          if (!isLoggingOut) {
            setLogoutModalOpen(false);
          }
        }}
      />
    </>
  );
};

export default Navbar;
