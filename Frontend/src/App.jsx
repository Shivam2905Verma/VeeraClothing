import { Routes, Route } from "react-router-dom";
import WebsiteLayout from "./main/layout/WebsiteLayout";
import Home from "./main/pages/home/Home";
import ProductDetail from "./main/pages/shop/ProductDetail";
import ShopAll from "./main/pages/shop/ShopAll";
import Cart from "./main/pages/cart/Cart";

const App = () => {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop/:id" element={<ProductDetail />} />
        <Route path="shopall" element={<ShopAll />} />
        <Route path="cart" element={<Cart />} />
      </Route>
    </Routes>
  );
};

export default App;
