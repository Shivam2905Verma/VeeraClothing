import { Link } from "react-router-dom";
import { brandDetail } from "../../../common/brandDetail";
import style from "../../style/page/dashboard.module.css";

const Dashboard = () => {
  // Sample recent activity/orders matching enterprise theme
  const recentOrders = [
    {
      id: "ORD-9421",
      customer: "Kajal Yadav",
      items: "2 items",
      total: "₹2,240.00",
      status: "PaymentAuthorized",
      date: "Today, 4:21 pm",
    },
    {
      id: "ORD-9420",
      customer: "Vijay Pilania",
      items: "1 item",
      total: "₹565.00",
      status: "PaymentSettled",
      date: "Today, 3:50 pm",
    },
    {
      id: "ORD-9419",
      customer: "Sushila Yadav",
      items: "1 item",
      total: "₹530.00",
      status: "Shipped",
      date: "Today, 3:45 pm",
    },
    {
      id: "ORD-9418",
      customer: "Dharmvir Dhillon",
      items: "3 items",
      total: "₹2,280.00",
      status: "PaymentSettled",
      date: "Today, 3:42 pm",
    },
  ];

  return (
    <div className={style.dashboardPage}>
      {/* Header Row */}
      <div className={style.pageHeader}>
        <div>
          <h1 className={style.welcomeTitle}>Insights & Overview</h1>
          <p className={style.welcomeSubtitle}>
            Welcome back. Real-time store performance for {brandDetail.brandName}.
          </p>
        </div>

        <div className={style.headerActions}>
          <Link to="/dashboard/products/add" className={style.primaryActionBtn}>
            <i className="ri-add-line" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Total Revenue</span>
            <span className={style.trendPositive}>+14.2%</span>
          </div>
          <span className={style.statValue}>₹45,280.00</span>
          <span className={style.statFootnote}>vs ₹39,600 last 30 days</span>
        </div>

        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Orders</span>
            <span className={style.trendPositive}>+8.5%</span>
          </div>
          <span className={style.statValue}>48</span>
          <span className={style.statFootnote}>4 awaiting shipment</span>
        </div>

        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Active Products</span>
            <span className={style.trendNeutral}>100% live</span>
          </div>
          <span className={style.statValue}>124</span>
          <span className={style.statFootnote}>5 low stock alerts</span>
        </div>

        <div className={style.statCard}>
          <div className={style.statTop}>
            <span className={style.statLabel}>Customers</span>
            <span className={style.trendPositive}>+18.1%</span>
          </div>
          <span className={style.statValue}>89</span>
          <span className={style.statFootnote}>New registrations</span>
        </div>
      </div>

      {/* Recent Orders Section styled like enterprise data table */}
      <div className={style.tableSection}>
        <div className={style.tableHeaderArea}>
          <div className={style.tableTitleRow}>
            <h2 className={style.sectionHeading}>Recent Orders</h2>
            <span className={style.countBadge}>{recentOrders.length}</span>
          </div>
          <Link to="/dashboard/orders" className={style.viewAllLink}>
            <span>View all orders</span>
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        <div className={style.tableWrapper}>
          <table className={style.table}>
            <thead>
              <tr className={style.tableHeaderRow}>
                <th className={style.th}>Order ID</th>
                <th className={style.th}>Customer</th>
                <th className={style.th}>Items</th>
                <th className={style.th}>Total</th>
                <th className={style.th}>State</th>
                <th className={style.th}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord.id} className={style.tableRow}>
                  <td className={style.td}>
                    <span className={style.orderIdLink}>{ord.id}</span>
                  </td>
                  <td className={style.td}>
                    <span className={style.customerName}>{ord.customer}</span>
                  </td>
                  <td className={style.td}>
                    <span className={style.itemCount}>{ord.items}</span>
                  </td>
                  <td className={style.td}>
                    <span className={style.orderTotal}>{ord.total}</span>
                  </td>
                  <td className={style.td}>
                    <span
                      className={`${style.stateBadge} ${
                        ord.status === "PaymentSettled"
                          ? style.stateSettled
                          : ord.status === "Shipped"
                          ? style.stateShipped
                          : style.statePending
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className={style.td}>
                    <span className={style.orderDate}>{ord.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

