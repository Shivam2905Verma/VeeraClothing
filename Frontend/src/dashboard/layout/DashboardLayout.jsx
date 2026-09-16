import { Outlet } from "react-router-dom";
import style from "../style/layout/dashboardLayout.module.css";

const DashboardLayout = () => {
  return (
    <div className={style.dashboardLayout}>
      <div className={style.sidebar}>sidebar</div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
