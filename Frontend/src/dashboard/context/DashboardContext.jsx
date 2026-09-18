import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, logout as apiLogout } from "../service/auth.service";

export const DashboardContext = createContext();

export const DashboardContextProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMe();
      if (res?.success && res?.admin) {
        setAdminData(res.admin);
      } else {
        setAdminData(null);
      }
    } catch (error) {
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const login = (admin) => {
    setAdminData(admin);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setAdminData(null);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        adminData,
        loading,
        login,
        logout,
        fetchAdmin,
        isAuthenticated: !!adminData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardContextProvider");
  }
  return context;
};
