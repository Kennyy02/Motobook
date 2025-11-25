import React, { useState } from "react";
import "../../styles/customer/CategoryFilterPanel.css"; // Adjust the path if needed

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

const allCategories = Array.from(
  new Set(
    Object.values(groupedCategories)
      .flat()
      .map((cat) => cat.trim())
  )
).sort((a, b) => a.localeCompare(b));

const CategoryFilterPanel = ({ onCategoryChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const handleCheckboxChange = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    onCategoryChange(updated);
  };

  const filteredCategories = allCategories.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriesToShow = showAll
    ? filteredCategories
    : filteredCategories.slice(0, 9);

  return (
    <div className="filter-panel">
      <input
        type="text"
        placeholder="Search categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filter-search"
      />
      <ul className="flat-category-list">
        {categoriesToShow.map((item) => (
          <li key={item}>
            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes(item)}
                onChange={() => handleCheckboxChange(item)}
              />
              {item}
            </label>
          </li>
        ))}
      </ul>
      {filteredCategories.length > 9 && (
        <button
          className="show-toggle-button"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default CategoryFilterPanel;
