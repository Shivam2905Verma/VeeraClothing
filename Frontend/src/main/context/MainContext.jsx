import { createContext, useState, useEffect } from "react";
import { getCart } from "../services/cart.service";

export const MainContext = createContext();

const MainContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const fetchInitialCart = async () => {
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
        // User may be unauthenticated or logged out
      }
    };

    fetchInitialCart();
  }, []);

  return (
    <MainContext.Provider value={{ cartItems, setCartItems }}>
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
