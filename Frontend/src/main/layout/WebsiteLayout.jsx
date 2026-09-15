import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import style from "../style/layout/websitelayout.module.css";

const WebsiteLayout = () => {
  return (
    <div className={style.layoutWrapper}>
      <Navbar />
      <main className={style.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
