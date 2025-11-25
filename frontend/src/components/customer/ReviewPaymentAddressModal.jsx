import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";

import LocationPicker from "./LocationPicker";
import { X, LocateIcon, MapPin, Map } from "lucide-react";
import {
  useAddressAutocomplete,
  formatAddress,
} from "../../components/customer/useAddressAutocomplete.js";
import "../../styles/customer/ReviewPaymentAddressModal.css";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const ReviewPaymentAddressModal = ({
  isOpen,
  onClose,
  cartItems,
  onConfirm,
  defaultLocation,
  user,
  restaurant,
  clearCart,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [addressInput, setAddressInput] = useState(
    defaultLocation?.address || ""
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  const { suggestions, fetchSuggestions, setSuggestions, resolveAddress } =
    useAddressAutocomplete();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  //Order service domain
  const orderServiceBaseURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  const handleLocationConfirm = (location) => {
    setSelectedLocation(location);
    setAddressInput(location.address);
    localStorage.setItem("location", location.address);
    setShowMapPicker(false);
  };

  const handleClearInput = () => {
    setAddressInput("");
    setSelectedLocation(null);
    setSuggestions([]);
  };

  const handleFindClick = async () => {
    if (addressInput.trim()) {
      const result = await resolveAddress(addressInput);
      if (result) {
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: formatAddress(result.address) || result.display_name,
        };
        handleLocationConfirm(location);
      } else {
        alert("Address not found.");
      }
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
        );
        const data = await res.json();
        const location = {
          lat: latitude,
          lng: longitude,
          address: formatAddress(data.address) || data.display_name,
        };
        handleLocationConfirm(location);
      },
      () => alert("Location access denied.")
    );
  };

  const handleSuggestionClick = (s) => {
    const location = {
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
      address: formatAddress(s.address) || s.display_name,
    };
    handleLocationConfirm(location);
    setSuggestions([]);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedLocation) {
      alert("Please select a delivery location.");
      return;
    }

    try {
      const payload = {
        user,
        cartItems,
        location: selectedLocation,
        totalAmount,
        restaurant,
      };

      const response = await axios.post(
        `${orderServiceBaseURL}/api/orders/create`,
        // "/api/orders/create",
        payload
      );

      if (response.status === 201) {
        alert("Order placed successfully!");
        clearCart?.(); // ✅ Empty the cart
        localStorage.removeItem("cartItems");
        onConfirm({ location: selectedLocation }); // Optional: handle after-confirm logic
        onClose();
      } else {
        alert("Something went wrong while placing your order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  // 🛵 Fetch route using OpenRouteService
  useEffect(() => {
    const fetchRoute = async () => {
      if (!restaurant || !selectedLocation) return;

      try {
        const response = await axios.post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            coordinates: [
              [restaurant.longitude, restaurant.latitude],
              [selectedLocation.lng, selectedLocation.lat],
            ],
          },
          {
            headers: {
              Authorization:
                "5b3ce3597851110001cf624849d65dc39b2d4136b02f7530a67871be",
              "Content-Type": "application/json",
            },
          }
        );

        const coords = response.data.features[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRouteCoords(coords);
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
  }, [restaurant, selectedLocation]);

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" style={{ zIndex: 999 }}>
      <div className="review-modal">
        <h2>Checkout</h2>

        {/* Order Summary */}
        <section className="order-summary">
          <p className="customer-name">
            <strong>Name:</strong> {user?.fullName || user?.name || "Guest"}
          </p>
          <p className="customer-phone-number">
            <strong>Phone Number:</strong> {user.phone}
          </p>

          <ul className="review-cart-items">
            {cartItems.map((item) => (
              <li key={item.id}>
                <div className="item-left">
                  <img src={item.image} alt="item pic" />
                  <div className="item-info">
                    <strong>{item.productName}</strong>
                    <span className="quantity-price">
                      {item.quantity} × ₱{item.price}
                    </span>
                  </div>
                </div>
                <span className="item-total">
                  ₱{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Delivery Address */}
        <section className="address-section">
          <p className="section-title">Delivery Address</p>

          <div className="input-wrapper">
            <div className="address-inline-display">
              <MapPin size={16} style={{ marginRight: 8 }} />
              <input
                type="text"
                placeholder="Search address"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                style={{ flex: 1 }}
              />
              {addressInput && (
                <X
                  size={18}
                  onClick={handleClearInput}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>

            <div className="button-group">
              <button onClick={handleFindClick}>
                <MapPin size={14} /> Find
              </button>
              <button onClick={handleLocateMe}>
                <LocateIcon size={14} /> Locate Me
              </button>
              <button onClick={() => setShowMapPicker(true)}>
                <Map size={14} /> Choose from Map
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <ul className="autocomplete-suggestions">
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => handleSuggestionClick(s)}>
                  {formatAddress(s.address) || s.display_name}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Map Picker Modal */}
        {showMapPicker && (
          <LocationPicker
            isOpen={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            onConfirm={handleLocationConfirm}
            defaultLocation={selectedLocation}
          />
        )}

        {/* Route Map */}
        {selectedLocation && restaurant && (
          <div
            style={{
              height: "300px",
              marginTop: "1rem",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={[
                (restaurant.latitude + selectedLocation.lat) / 2,
                (restaurant.longitude + selectedLocation.lng) / 2,
              ]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />

              <Marker position={[restaurant.latitude, restaurant.longitude]}>
                <Popup>Restaurant</Popup>
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  {restaurant.businessName}
                </Tooltip>
              </Marker>

              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>Your Location</Popup>
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  Your Location
                </Tooltip>
              </Marker>

              {routeCoords.length > 0 && (
                <Polyline positions={routeCoords} color="red" />
              )}
            </MapContainer>
          </div>
        )}

        {/* Total */}
        <p className="review-total">Total: ₱{totalAmount}</p>

        {/* Action Buttons */}
        <div className="review-buttons">
          <button onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button onClick={handleConfirmCheckout} className="place-order-btn">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPaymentAddressModal;
