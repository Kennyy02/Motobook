import "../../styles/customer/RestaurantList.css";
import React, { useState, useMemo, useRef, useEffect } from "react";
import CategoryFilterPanel from "./CategoryFilterPanel";
import { Lock, ChevronLeft, ChevronRight, Search } from "lucide-react";

const RestaurantList = ({
  recommendedRestaurants = [],
  allRestaurants = [],
  onSelectRestaurant,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const recommendedRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateChevronState = () => {
    const el = recommendedRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const scrollRecommended = (offset) => {
    if (recommendedRef.current) {
      recommendedRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(updateChevronState, 300);
    }
  };

  useEffect(() => {
    const el = recommendedRef.current;
    if (!el) return;

    const handleScroll = () => updateChevronState();
    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateChevronState);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateChevronState);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateChevronState();
    }, 100);

    return () => clearTimeout(timer);
  }, [recommendedRestaurants, selectedCategories]);

  const approvedRecommended = recommendedRestaurants.filter(
    (restaurant) => restaurant.status === "approved"
  );
  const approvedAll = allRestaurants.filter(
    (restaurant) => restaurant.status === "approved"
  );

  // Filter by categories AND search query
  const filteredRecommended = useMemo(() => {
    return approvedRecommended.filter((r) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        r.categories?.some((cat) => selectedCategories.includes(cat));
      const matchesSearch =
        searchQuery === "" ||
        r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [approvedRecommended, selectedCategories, searchQuery]);

  const filteredAll = useMemo(() => {
    return approvedAll.filter((r) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        r.categories?.some((cat) => selectedCategories.includes(cat));
      const matchesSearch =
        searchQuery === "" ||
        r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [approvedAll, selectedCategories, searchQuery]);

  const availableRecommended = filteredRecommended.filter((r) => r.isOpen);
  const unavailableRecommended = filteredRecommended.filter((r) => !r.isOpen);

  const availableAll = filteredAll.filter((r) => r.isOpen);
  const unavailableAll = filteredAll.filter(
    (r) => !r.isOpen && !unavailableRecommended.some((rec) => rec.id === r.id)
  );

  const renderRestaurantCard = (restaurant, keyPrefix) => (
    <div
      key={`${keyPrefix}-${restaurant.id}`}
      className={`restaurant-card ${!restaurant.isOpen ? "closed" : ""}`}
      onClick={() => {
        if (restaurant.isOpen) onSelectRestaurant(restaurant);
      }}
    >
      <div className="image-wrapper">
        <img
          src={restaurant.logo}
          alt={`${restaurant.businessName} Logo`}
          className="restaurant-logo"
        />
        {!restaurant.isOpen && (
          <div className="image-overlay">
            <div className="overlay-content">
              <Lock size={20} className="lock-icon" />
              <span className="overlay-text">Closed</span>
            </div>
          </div>
        )}
      </div>
      <div className="restaurant-content">
        <h3>{restaurant.businessName}</h3>
        <p>{restaurant.address}</p>
      </div>
    </div>
  );

  const hasAnyRestaurants =
    availableRecommended.length ||
    availableAll.length ||
    unavailableRecommended.length ||
    unavailableAll.length;

  const noResultsFound =
    searchQuery &&
    availableRecommended.length === 0 &&
    availableAll.length === 0 &&
    unavailableRecommended.length === 0 &&
    unavailableAll.length === 0;

  if (!hasAnyRestaurants && !searchQuery) {
    return (
      <div className="restaurant-list-layout">
        <div className="restaurant-list-wrapper center-content">
          <div className="no-restaurants">
            <div className="empty-icon">🍽️</div>
            <h3>No restaurants available</h3>
            <p>Check back later for delicious options!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-list-layout">
      <div className="restaurant-list-wrapper">
        {/* Search & Filter Section */}
        <div className="search-filter-section">
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
          <CategoryFilterPanel onCategoryChange={setSelectedCategories} />
        </div>

        {noResultsFound && (
          <div className="no-results-state">
            <div className="empty-icon">🔍</div>
            <h3>No restaurants found</h3>
            <p>Try adjusting your search or filters</p>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {availableRecommended.length > 0 && (
          <div className="restaurant-section">
            <h2 className="section-title">
              <span className="title-icon">⭐</span>
              Recommended For You
            </h2>
            <div className="chevron-wrapper">
              <button
                className="chevron-button left"
                onClick={() => scrollRecommended(-250)}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft />
              </button>
              <div className="restaurant-grid scrollable" ref={recommendedRef}>
                {availableRecommended.map((r) =>
                  renderRestaurantCard(r, "rec-available")
                )}
              </div>
              <button
                className="chevron-button right"
                onClick={() => scrollRecommended(250)}
                disabled={!canScrollRight}
                aria-label="Scroll right"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {availableAll.length > 0 && (
          <div className="restaurant-section">
            <h2 className="section-title">
              <span className="title-icon">🍴</span>
              All Restaurants
            </h2>
            <div className="restaurant-grid">
              {availableAll.map((r) =>
                renderRestaurantCard(r, "all-available")
              )}
            </div>
          </div>
        )}

        {(unavailableRecommended.length > 0 || unavailableAll.length > 0) && (
          <div className="restaurant-section unavailable-section">
            <h2 className="section-title">
              <span className="title-icon">🔒</span>
              Currently Closed
            </h2>
            <div className="restaurant-grid">
              {unavailableRecommended.map((r) =>
                renderRestaurantCard(r, "rec-unavailable")
              )}
              {unavailableAll.map((r) =>
                renderRestaurantCard(r, "all-unavailable")
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;
