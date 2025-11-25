import React, { useState, useEffect } from "react";
import "../../styles/seller/CategorySelectorModal.css";

const CATEGORY_GROUPS = {
  Cuisines: [
    "American",
    "Asian",
    "Chinese",
    "Filipino",
    "Indian",
    "Italian",
    "Japanese",
    "Korean",
    "Middle Eastern",
    "Thai",
    "Western",
  ],
  "Main Dishes": [
    "BBQ",
    "Biryani",
    "Bulalo",
    "Burgers",
    "Chicken",
    "Chicken Wings",
    "Curry",
    "Dim Sum",
    "Dumpling",
    "Fried Chicken",
    "Halo-Halo",
    "Kare Kare",
    "Lechon",
    "Liempo",
    "Lomi",
    "Noodles",
    "Pancit",
    "Pares",
    "Pasta",
    "Pizza",
    "Rice Bowl",
    "Rice Dishes",
    "Rice Noodles",
    "Sinigang",
    "Sisig",
    "Ulam",
  ],
  "Snacks & Sides": [
    "Bread",
    "Corndogs",
    "Fries",
    "Fruit Shake",
    "Ice Cream",
    "Milk Tea",
    "Salads",
    "Sandwiches",
    "Seafood",
    "Shawarma",
    "Silog",
    "Snacks",
    "Soups",
    "Takoyaki",
    "Wraps",
  ],
  Desserts: ["Cakes", "Desserts", "Donut", "Fast Food"],
  Beverages: ["Beverages", "Coffee", "Fruit Shake", "Milk Tea"],
  "Fast Food": ["Fast Food", "Burgers", "Corndogs", "Fries"],
};

const CategorySelectorModal = ({
  isOpen,
  onClose,
  selectedCategories,
  onConfirm,
}) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(selectedCategories || []);
  }, [selectedCategories, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (category) => {
    if (selected.includes(category)) {
      setSelected(selected.filter((c) => c !== category));
    } else {
      if (selected.length >= 5) {
        alert("You can select up to 5 categories only.");
        return;
      }
      setSelected([...selected, category]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="category-modal">
        <h2>Select up to 5 Categories</h2>
        <div className="category-groups">
          {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
            <div key={groupName} className="category-group">
              <h3>{groupName}</h3>
              <div className="category-list">
                {categories.map((category) => (
                  <label
                    key={category}
                    className={`category-item ${
                      selected.includes(category) ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={() => onConfirm(selected)}>Confirm</button>
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectorModal;
