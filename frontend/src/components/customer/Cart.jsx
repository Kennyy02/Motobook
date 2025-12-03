import React from "react";
import { ShoppingCart } from "lucide-react";
import "../../styles/customer/Cart.css";

const Cart = ({ cartItems = [], onToggleCart }) => {
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="cart-icon-wrapper" onClick={onToggleCart}>
      <ShoppingCart size={24} />
      {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
    </div>
  );
};

export default Cart;
