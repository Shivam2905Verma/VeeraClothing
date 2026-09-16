import { brandDetail } from "../../../common/brandDetail";
import style from "../../style/page/dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={style.dashboardPage}>
      <div className={style.pageHeader}>
        <h1 className={style.welcomeTitle}>Welcome back, Admin</h1>
        <p className={style.welcomeSubtitle}>
          Here is an overview of {brandDetail.brandName} performance.
        </p>
      </div>

      {/* Quick Summary Grid */}
      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Total Products</span>
            <span className={style.statValue}>124</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconProducts}`}>
            <i className="ri-shopping-bag-3-line" style={{ fontSize: "1.5rem" }} />
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Total Orders</span>
            <span className={style.statValue}>48</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconOrders}`}>
            <i className="ri-shopping-cart-line" style={{ fontSize: "1.5rem" }} />
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Revenue</span>
            <span className={style.statValue}>₹45,280</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconRevenue}`}>
            <i className="ri-money-rupee-circle-line" style={{ fontSize: "1.5rem" }} />
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Active Customers</span>
            <span className={style.statValue}>89</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconUsers}`}>
            <i className="ri-user-smile-line" style={{ fontSize: "1.5rem" }} />
          </div>
        </div>
      </div>

      {/* Recent Activity / Overview Card */}
      <div className={style.cardSection}>
        <div className={style.cardSectionHeader}>
          <h2 className={style.cardTitle}>Recent Orders</h2>
        </div>
        <div className={style.emptyState}>
          No recent orders yet. Orders will appear here as customers place them.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

