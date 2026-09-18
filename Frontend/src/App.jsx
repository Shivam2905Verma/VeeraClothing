import { Routes, Route } from "react-router-dom";
import WebsiteLayout from "./main/layout/WebsiteLayout";
import Home from "./main/pages/home/Home";
import ProductDetail from "./main/pages/shop/ProductDetail";
import ShopAll from "./main/pages/shop/ShopAll";
import Cart from "./main/pages/cart/Cart";
import Login from "./main/pages/auth/Login";
import Register from "./main/pages/auth/Register";
import VerifyEmail from "./main/pages/verifyEmail/VerifyEmail";
import DashboardLayout from "./dashboard/layout/DashboardLayout";
import Dashboard from "./dashboard/pages/dashboard/Dashboard";
import Product from "./dashboard/pages/product/Product";
import AddProduct from "./dashboard/pages/product/AddProduct";
import EditProduct from "./dashboard/pages/product/EditProduct";
import Category from "./dashboard/pages/category/Category";
import AddCategory from "./dashboard/pages/category/AddCategory";
import Measurement from "./dashboard/pages/measurement/Measurement";
import AddMeasurement from "./dashboard/pages/measurement/AddMeasurement";
import DashboardLogin from "./dashboard/pages/auth/Login";
import ProtectedDashboardRoute from "./dashboard/components/protected/ProtectedDashboardRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop/:id" element={<ProductDetail />} />
        <Route path="shopall" element={<ShopAll />} />
        <Route path="cart" element={<Cart />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verifyemail" element={<VerifyEmail />} />
      <Route path="dashboard/login" element={<DashboardLogin />} />
      <Route
        path="dashboard"
        element={
          <ProtectedDashboardRoute>
            <DashboardLayout />
          </ProtectedDashboardRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Product />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="categories" element={<Category />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="measurements" element={<Measurement />} />
        <Route path="measurements/add" element={<AddMeasurement />} />
        {/* <Route path="orders" element={<Orders />} /> */}
      </Route>
    </Routes>
  );
};

export default App;
