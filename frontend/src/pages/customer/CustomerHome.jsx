import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/landing/Header";
import "../../styles/customer/CustomerHome.css";
import CategorySelectorModal from "../../components/seller/CategorySelectorModal.jsx";
import RestaurantList from "../../components/customer/RestaurantList";
import axios from "axios";
import MenuPage from "../../components/customer/MenuPage.jsx";
import CartPanel from "../../components/customer/CartPanel.jsx";
import ReviewPaymentAddressModal from "../../components/customer/ReviewPaymentAddressModal";

const businessServiceBaseURL =
  import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

const CustomerHome = () => {
  const { user } = useContext(AuthContext);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [userCategories, setUserCategories] = useState([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [menuCartVisible, setMenuCartVisible] = useState(false);
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);

  const clearCart = () => setCartItems([]);

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  const fetchAllRestaurants = async () => {
    try {
      const res = await axios.get(
        `${businessServiceBaseURL}/api/business/all-restaurants`
      );
      return res.data;
    } catch (error) {
      console.error(
        "Error fetching all restaurants:",
        error.response?.status,
        error.response?.data
      );
      return [];
    }
  };

  const fetchRecommendedRestaurants = async (userId) => {
    try {
      const res = await axios.get(
        `${businessServiceBaseURL}/api/business/recommended/${userId}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching recommended restaurants:", error);
      return [];
    }
  };

  const getUserPreferences = async (userId) => {
    try {
      const res = await axios.get(
        `${userServiceBaseURL}/api/auth/preferences/${userId}`
      );
      return res.data.preferences || [];
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      return [];
    }
  };

  const saveUserPreferences = async (userId, categories) => {
    await axios.post(`${userServiceBaseURL}/api/auth/preferences`, {
      userId,
      categories,
    });
  };

  const handleCategoryConfirm = async (categories) => {
    try {
      await saveUserPreferences(user.id, categories);
      setUserCategories(categories);
      setCategoryModalOpen(false);
      localStorage.setItem(`categoryModalShown_${user.id}`, "true");
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists
        ? prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleIncrease = (item) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      setCartItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    }
  };

  const handleBulkDelete = (selectedIds) => {
    setCartItems((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id))
    );
  };

  const handleConfirmOrder = ({ location }) => {
    console.log("Confirmed order with location:", location);
    setSelectedLocation(location);
  };

  const toggleCartPanel = () => {
    setIsCartPanelOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!user) return;

    const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const savedRestaurant = JSON.parse(
      localStorage.getItem("selectedRestaurant")
    );
    const savedMenuCartVisible = JSON.parse(
      localStorage.getItem("menuCartVisible")
    );

    if (savedRestaurant) setSelectedRestaurant(savedRestaurant);
    if (savedCart.length > 0) setCartItems(savedCart);
    if (savedRestaurant && savedCart.length > 0 && savedMenuCartVisible) {
      setMenuCartVisible(true);
    } else {
      setMenuCartVisible(false);
    }

    const fetchData = async () => {
      const [recommended, all] = await Promise.all([
        fetchRecommendedRestaurants(user.id),
        fetchAllRestaurants(),
      ]);
      setRecommendedRestaurants(recommended);
      setAllRestaurants(all);
    };

    const fetchPreferences = async () => {
      try {
        const prefs = await getUserPreferences(user.id);
        setUserCategories(prefs);

        const modalShown = localStorage.getItem(
          `categoryModalShown_${user.id}`
        );
        if ((!prefs || prefs.length === 0) && !modalShown) {
          setCategoryModalOpen(true);
          localStorage.setItem(`categoryModalShown_${user.id}`, "true");
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setLoadingPrefs(false);
      }
    };

    fetchData();
    fetchPreferences();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (selectedRestaurant) {
      localStorage.setItem(
        "selectedRestaurant",
        JSON.stringify(selectedRestaurant)
      );
    } else {
      localStorage.removeItem("selectedRestaurant");
      localStorage.removeItem("cartItems");
    }
  }, [selectedRestaurant]);

  return (
    <div className="customer-home">
      <Header
        showCart={!!selectedRestaurant}
        cartItems={cartItems}
        onToggleCart={toggleCartPanel}
        navigateToMenu={() => {
          if (!selectedRestaurant) return;
          setMenuCartVisible(true);
          localStorage.setItem("menuCartVisible", JSON.stringify(true));
        }}
      />

      {!loadingPrefs && (
        <CategorySelectorModal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          selectedCategories={userCategories}
          onConfirm={handleCategoryConfirm}
        />
      )}

      {!selectedRestaurant || !menuCartVisible ? (
        <RestaurantList
          recommendedRestaurants={recommendedRestaurants}
          allRestaurants={allRestaurants}
          onSelectRestaurant={(restaurant) => {
            if (
              selectedRestaurant &&
              selectedRestaurant.id !== restaurant.id &&
              cartItems.length > 0
            ) {
              const confirmClear = window.confirm(
                "Switching restaurants will clear your current cart. Continue?"
              );
              if (!confirmClear) return;
              setCartItems([]);
            }
            setSelectedRestaurant(restaurant);
            setMenuCartVisible(true);
            localStorage.setItem("menuCartVisible", JSON.stringify(true));
          }}
        />
      ) : (
        <div className="menu-cart-container">
          <MenuPage
            businessId={selectedRestaurant.id}
            businessName={selectedRestaurant.businessName}
            onBack={() => {
              setMenuCartVisible(false);
              localStorage.setItem("menuCartVisible", JSON.stringify(false));
            }}
            onAddToCart={handleAddToCart}
          />
          <CartPanel
            cartItems={cartItems}
            isOpen={isCartPanelOpen}
            onClose={() => {
              setIsCartPanelOpen(false);
            }}
            onCheckoutClick={() => setCheckoutModalOpen(true)}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onBulkDelete={handleBulkDelete}
          />
          <ReviewPaymentAddressModal
            isOpen={checkoutModalOpen}
            onClose={() => setCheckoutModalOpen(false)}
            cartItems={cartItems}
            clearCart={clearCart}
            onConfirm={handleConfirmOrder}
            defaultLocation={selectedLocation}
            user={user}
            restaurant={selectedRestaurant}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
