import React, { useState, useRef, useEffect } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import "../../styles/customer/CategoryFilterPanel.css";

const groupedCategories = {
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

const CategoryFilterPanel = ({ onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCheckboxChange = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    onCategoryChange(updated);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    onCategoryChange([]);
  };

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button
        className="filter-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        <span>Filters</span>
        {selectedCategories.length > 0 && (
          <span className="filter-count">{selectedCategories.length}</span>
        )}
        <ChevronDown
          size={18}
          className={`chevron-icon ${isOpen ? "rotated" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="filter-dropdown-panel">
          <div className="filter-header">
            <h3>Filter by Category</h3>
            {selectedCategories.length > 0 && (
              <button className="clear-all-button" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>

          <div className="filter-categories-list">
            {Object.entries(groupedCategories).map(([group, categories]) => (
              <div key={group} className="category-group">
                <button
                  className="group-header"
                  onClick={() => toggleGroup(group)}
                >
                  <span className="group-name">{group}</span>
                  <ChevronDown
                    size={16}
                    className={`group-chevron ${
                      expandedGroups[group] ? "rotated" : ""
                    }`}
                  />
                </button>

                {expandedGroups[group] && (
                  <div className="category-items">
                    {categories.map((item) => (
                      <label key={item} className="category-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(item)}
                          onChange={() => handleCheckboxChange(item)}
                          className="category-checkbox"
                        />
                        <span className="category-name">{item}</span>
                        {selectedCategories.includes(item) && (
                          <span className="checkmark">✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="filter-footer">
            <button className="apply-button" onClick={() => setIsOpen(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterPanel;
