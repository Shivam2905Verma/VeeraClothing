import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import IntroScreen from "../components/common/IntroScreen";
import style from "../style/layout/websitelayout.module.css";

const WebsiteLayout = () => {
  return (
    <div className={style.layoutWrapper}>
      <IntroScreen />
      <Navbar />
      <main className={style.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
