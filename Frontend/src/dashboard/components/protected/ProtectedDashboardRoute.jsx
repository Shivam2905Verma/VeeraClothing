import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";

const ProtectedDashboardRoute = ({ children }) => {
  const { adminData, loading } = useDashboard();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#fbfbfb",
          color: "#666666",
          gap: "14px",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid #e5e5e5",
            borderTopColor: "#111111",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.04em" }}>
          Verifying administrative session...
        </span>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!adminData) {
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedDashboardRoute;
