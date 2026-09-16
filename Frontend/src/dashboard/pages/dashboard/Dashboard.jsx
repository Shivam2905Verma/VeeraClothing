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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Total Orders</span>
            <span className={style.statValue}>48</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconOrders}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Revenue</span>
            <span className={style.statValue}>₹45,280</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconRevenue}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statInfo}>
            <span className={style.statLabel}>Active Customers</span>
            <span className={style.statValue}>89</span>
          </div>
          <div className={`${style.statIconWrapper} ${style.statIconUsers}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
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

