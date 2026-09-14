import { Routes, Route } from "react-router-dom";
import WebsiteLayout from "./main/layout/WebsiteLayout";
import Home from "./main/pages/home/Home";
import ProductDetail from "./main/pages/shop/ProductDetail";

const App = () => {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop/:id" element={<ProductDetail />} />
      </Route>
    </Routes>
  );
};

export default App;
