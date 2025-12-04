import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
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

  // Handle body scroll lock for mobile
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("filter-open");
    } else {
      document.body.classList.remove("filter-open");
    }

    return () => {
      document.body.classList.remove("filter-open");
    };
  }, [isOpen]);

  // Handle click outside to close (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth >= 768) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

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

  const handleApplyFilters = () => {
    setIsOpen(false);
  };

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button
        className="filter-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle filters"
        aria-expanded={isOpen}
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
        <>
          {/* Backdrop for tablet view */}
          <div
            className="filter-backdrop"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <div className="filter-dropdown-panel">
            <div className="filter-header">
              <div className="filter-header-left">
                <button
                  className="close-button"
                  onClick={handleClose}
                  aria-label="Close filters"
                >
                  <X size={24} />
                </button>
                <h3>Filter by Category</h3>
              </div>
              {selectedCategories.length > 0 && (
                <button
                  className="clear-all-button"
                  onClick={handleClearAll}
                  aria-label="Clear all filters"
                >
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
                    aria-expanded={expandedGroups[group]}
                    aria-controls={`group-${group}`}
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
                    <div
                      className="category-items"
                      id={`group-${group}`}
                      role="group"
                      aria-label={`${group} categories`}
                    >
                      {categories.map((item) => (
                        <label key={item} className="category-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(item)}
                            onChange={() => handleCheckboxChange(item)}
                            className="category-checkbox"
                            aria-label={item}
                          />
                          <span className="category-name">{item}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="filter-footer">
              <button
                className="apply-button"
                onClick={handleApplyFilters}
                aria-label="Apply filters"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryFilterPanel;
