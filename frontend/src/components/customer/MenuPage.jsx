import axios from "axios";
import { useState, useEffect } from "react";
import { Search } from "lucide-react"; // install with `npm install lucide-react`
import "../../styles/customer/MenuPage.css";

const MenuPage = ({ businessId, businessName, onBack, onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(
          `${businessServiceBaseURL}/api/business/menu-items/${businessId}`
          // `/api/business/menu-items/${businessId}`
        );
        setMenuItems(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };

    fetchMenu();
  }, [businessId]);

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.productName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="menu-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to restaurants
      </button>

      <h2>{businessName}'s Menu</h2>

      <div className="menu-controls">
        <div className="category-tabs">
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {categories.map((category) => (
            <button
              key={category}
              className={`tab-button ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="menu-item-card">
            {item.image && <img src={item.image} alt={item.productName} />}
            <h4>{item.productName}</h4>
            <p>{item.description}</p>
            <strong>₱{item.price}</strong>
            <button onClick={() => onAddToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
