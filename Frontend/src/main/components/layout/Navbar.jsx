import style from "../../style/components/navbar.module.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className={style.container}>
      <div className={style.top}>
        <div className={style.topleft}>
          <span className={style.mobileonly + " " + style.menubar}>
            <i class="ri-menu-line"></i>
          </span>
          <span className={style.login + " " + style.computeronly}>
            <i class="ri-user-line"></i> Login / Register
          </span>
        </div>
        <div className={style.topcenter}>VEERA CLOTHING</div>
        <div className={style.topright}>
          <i class="ri-search-line"></i>
          <i class="ri-handbag-line"></i>
          <div className={style.cartCount}>0</div>
        </div>
      </div>
      <div className={style.linkcontainer}>
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
    </div>
  );
};

export default Navbar;
