import { createContext, useState, useEffect } from "react";
import { getCart } from "../services/cart.service";
import { getMe } from "../services/auth.service";
import { getNewArrivals } from "../services/product.service";

export const MainContext = createContext();

const MainContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [newAravialProducts, setNewAravialProducts] = useState([]);

  const fetchUser = async () => {
    try {
      const res = await getMe();
      if (res?.success && res?.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const res = await getNewArrivals();
      if (res?.success && Array.isArray(res.products)) {
        setNewAravialProducts(res.products);
      }
    } catch (error) {
      console.error("Failed to fetch new arrivals in MainContext:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res?.success && Array.isArray(res.items)) {
        const itemsObj = {};
        res.items.forEach((item) => {
          itemsObj[item.variant_id] = {
            cartItemId: item.cart_item_id,
            productId: item.product_id,
            categoryId: item.category_id,
            variantId: item.variant_id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            color: item.color,
            image_url: item.image_url,
          };
        });
        setCartItems(itemsObj);
      }
    } catch (error) {
      // User may be unauthenticated or cart empty
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCart();
    fetchNewArrivals();
  }, []);

  return (
    <MainContext.Provider
      value={{
        user,
        setUser,
        cartItems,
        setCartItems,
        fetchUser,
        fetchCart,
        isAuthLoading,
        newAravialProducts,
        setNewAravialProducts,
        fetchNewArrivals,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;

