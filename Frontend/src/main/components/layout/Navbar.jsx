import style from "../../style/components/navbar.module.css";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { MainContext } from "../../context/MainContext";
import SearchOverlay from "./SearchOverlay";

const Navbar = () => {
  const { cartItems, user } = useContext(MainContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
          <span className={style.mobileonly + " " + style.menubar}>
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
          <Link to="/cart" className={style.cart}>
            <i className="ri-handbag-line"></i>
            <div className={style.cartCount}>{totalCartCount}</div>
          </Link>
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

      {/* Standalone Full-Screen Search Overlay with Real DB Categories */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
