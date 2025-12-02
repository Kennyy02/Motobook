import "../../styles/customer/RestaurantList.css";
import React, { useState, useMemo, useRef, useEffect } from "react";
import CategoryFilterPanel from "./CategoryFilterPanel";
import { Lock, ChevronLeft, ChevronRight } from "lucide-react";

const RestaurantList = ({
  recommendedRestaurants = [],
  allRestaurants = [],
  onSelectRestaurant,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
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
      // Update chevron state after a short delay to allow scroll animation
      setTimeout(updateChevronState, 300);
    }
  };

  // Handle scroll & resize
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

  // Update chevron state after recommended list is updated/rendered
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

  const filteredRecommended = useMemo(() => {
    return approvedRecommended.filter((r) => {
      if (selectedCategories.length === 0) return true;
      return r.categories?.some((cat) => selectedCategories.includes(cat));
    });
  }, [approvedRecommended, selectedCategories]);

  const filteredAll = useMemo(() => {
    return approvedAll.filter((r) => {
      if (selectedCategories.length === 0) return true;
      return r.categories?.some((cat) => selectedCategories.includes(cat));
    });
  }, [approvedAll, selectedCategories]);

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
              <Lock size={24} className="lock-icon" />
              <span className="overlay-text">Not Available</span>
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

  if (!hasAnyRestaurants) {
    return (
      <div className="restaurant-list-layout">
        <div className="restaurant-container">
          <CategoryFilterPanel onCategoryChange={setSelectedCategories} />
          <div className="restaurant-list-wrapper center-content">
            <p className="no-restaurants">No restaurants available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-list-layout">
      <CategoryFilterPanel onCategoryChange={setSelectedCategories} />

      <div className="restaurant-list-wrapper">
        {availableRecommended.length > 0 && (
          <div className="restaurant-section">
            <h2 className="section-title">Recommended For You</h2>
            <div className="chevron-wrapper">
              <button
                className="chevron-button left"
                onClick={() => scrollRecommended(-300)}
                disabled={!canScrollLeft}
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
                onClick={() => scrollRecommended(300)}
                disabled={!canScrollRight}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {availableAll.length > 0 && (
          <div className="restaurant-section">
            <h2 className="section-title">All Restaurants</h2>
            <div className="restaurant-grid">
              {availableAll.map((r) =>
                renderRestaurantCard(r, "all-available")
              )}
            </div>
          </div>
        )}

        {(unavailableRecommended.length > 0 || unavailableAll.length > 0) && (
          <div className="restaurant-section">
            <h2 className="section-title">Currently Not Available</h2>
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
