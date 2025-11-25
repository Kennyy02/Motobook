import React, { useState } from "react";
import { Minus, Plus, Trash2, PackageX, Pencil } from "lucide-react";
import "../../styles/customer/CartPanel.css";

const CartPanel = ({
  cartItems = [],
  onCheckoutClick,
  onIncrease,
  onDecrease,
  onBulkDelete,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const isAllSelected =
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  const toggleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (onBulkDelete && selectedItems.length > 0) {
      onBulkDelete(selectedItems);
      setSelectedItems([]);
    }
  };

  return (
    <div className="cart-panel">
      <div className="cart-panel-header">
        <h2>Your Cart</h2>
        {cartItems.length > 0 && (
          <button
            className="edit-btn"
            onClick={() => {
              setEditMode(!editMode);
              setSelectedItems([]); // reset selections
            }}
          >
            <Pencil size={18} />
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <PackageX size={48} strokeWidth={1.5} />
          <p>No items in cart.</p>
        </div>
      ) : (
        <>
          {editMode && (
            <div className="edit-controls">
              <label>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
                Select All
              </label>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedItems.length === 0}
              >
                Delete Selected
              </button>
            </div>
          )}

          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                {editMode && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                )}

                <span className="item-name">{item.productName}</span>

                <div className="quantity-controls">
                  {item.quantity > 1 ? (
                    <button onClick={() => onDecrease(item)}>
                      <Minus size={16} />
                    </button>
                  ) : (
                    <button onClick={() => onDecrease(item)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                  <span className="quantity">{item.quantity}</span>
                  <button onClick={() => onIncrease(item)}>
                    <Plus size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="cart-footer">
        <p className="total">Total: ₱{totalAmount}</p>
        <button
          className="checkout-btn"
          onClick={onCheckoutClick}
          disabled={cartItems.length === 0}
        >
          Review Payment and Address
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
