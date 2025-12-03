import axios from "axios";
import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, ShoppingCart, Plus } from "lucide-react";
import "../../styles/customer/MenuPage.css";

const MenuPage = ({ businessId, businessName, onBack, onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});

  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${businessServiceBaseURL}/api/business/menu-items/${businessId}`
        );
        setMenuItems(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchMenu();
    }
  }, [businessId, businessServiceBaseURL]);

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

  const handleAddToCart = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    }
    // Visual feedback
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1000);
  };

  return (
    <div className="menu-page">
      {/* Header Section */}
      <div className="menu-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Restaurants</span>
        </button>
        <div className="restaurant-name-section">
          <h1 className="restaurant-name">{businessName}</h1>
          <p className="restaurant-subtitle">Explore our delicious menu</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="menu-controls">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
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

      {/* Menu Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-item-card">
              <div className="menu-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.productName} />
                ) : (
                  <div className="image-placeholder">
                    <span className="placeholder-icon">🍽️</span>
                  </div>
                )}
              </div>
              <div className="menu-item-content">
                <h4 className="item-name">{item.productName}</h4>
                <p className="item-description">
                  {item.description || "Delicious dish"}
                </p>
                <div className="item-footer">
                  <span className="item-price">
                    ₱{Number(item.price).toFixed(2)}
                  </span>
                  <button
                    className={`add-to-cart-btn ${
                      addedItems[item.id] ? "added" : ""
                    }`}
                    onClick={() => handleAddToCart(item)}
                  >
                    {addedItems[item.id] ? (
                      <>
                        <ShoppingCart size={18} />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No items found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
