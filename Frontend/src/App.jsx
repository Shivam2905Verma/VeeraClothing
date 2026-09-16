import { Routes, Route } from "react-router-dom";
import WebsiteLayout from "./main/layout/WebsiteLayout";
import Home from "./main/pages/home/Home";
import ProductDetail from "./main/pages/shop/ProductDetail";
import ShopAll from "./main/pages/shop/ShopAll";
import Cart from "./main/pages/cart/Cart";
import Login from "./main/pages/auth/Login";
import Register from "./main/pages/auth/Register";

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
    </Routes>
  );
};

export default App;
