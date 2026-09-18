import { createContext, useState, useEffect } from "react";
import { getCart } from "../services/cart.service";
import { getMe } from "../services/auth.service";

export const MainContext = createContext();

const MainContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res?.success && Array.isArray(res.items)) {
        const itemsObj = {};
        res.items.forEach((item) => {
          itemsObj[item.variant_id] = {
            cartItemId: item.cart_item_id,
            productId: item.product_id,
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
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
