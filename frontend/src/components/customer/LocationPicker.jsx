import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import "leaflet/dist/leaflet.css";
import "../../styles/seller/BusinessLocationPicker.css";

const formatAddress = (addr) => {
  const street = addr.road || addr.pedestrian || "";
  const barangay = addr.suburb || addr.village || addr.hamlet || "";
  const city = addr.city || addr.town || addr.municipality || "";
  const postal = addr.postcode || "";
  const province = addr.state || addr.region || "";

  let parts = [];
  if (street) parts.push(street);
  if (barangay) parts.push(barangay);
  if (city) parts.push(city);
  if (postal) parts.push(postal);
  if (province) parts.push(province);

  return parts.join(", ");
};

const MapViewUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 16, { animate: true });
    }
  }, [position, map]);
  return null;
};

const LocationMarker = ({ position, setPosition, setAddress }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();

      const addr = data.address || {};
      const formattedAddress = formatAddress(addr);
      setAddress(formattedAddress || data.display_name || "");
    },
  });

  return position ? <Marker position={position} /> : null;
};

const LocationPicker = ({ isOpen, onClose, onConfirm, defaultLocation }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (defaultLocation) {
      setPosition({ lat: defaultLocation.lat, lng: defaultLocation.lng });
      setAddress(defaultLocation.address);
    }
  }, [defaultLocation]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const proxy = "https://corsproxy.io/?";
    const url = `${proxy}https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5`;

    const response = await fetch(url);
    const results = await response.json();
    setSuggestions(results);
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    fetchSuggestions(val);
  };

  const handleSuggestionClick = (suggestion) => {
    const loc = suggestion;
    setPosition({
      lat: parseFloat(loc.lat),
      lng: parseFloat(loc.lon),
    });

    const addr = loc.address || {};
    const formattedAddress = formatAddress(addr);
    setAddress(formattedAddress || loc.display_name);
    setSuggestions([]);
  };

  const handleAddressSubmit = async () => {
    if (!address) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&addressdetails=1&limit=1`;

    const response = await fetch(url);
    const results = await response.json();

    if (results.length === 0) {
      alert("Address not found.");
      return;
    }

    const loc = results[0];
    setPosition({
      lat: parseFloat(loc.lat),
      lng: parseFloat(loc.lon),
    });

    const addr = loc.address || {};
    const formattedAddress = formatAddress(addr);
    setAddress(formattedAddress || loc.display_name);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddressSubmit();
    }
  };

  const handleConfirm = () => {
    if (position && address) {
      onConfirm({ ...position, address });
      onClose();
    } else {
      alert("Please select or enter a location.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Pick Location"
    >
      <h3>Choose Your Location</h3>

      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your address or choose on the map"
          className="form-input"
          autoComplete="off"
          style={{ width: "100%", paddingRight: "2.5rem" }}
        />
        <button
          onClick={handleAddressSubmit}
          type="button"
          className="search-icon-button"
          aria-label="Search"
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Search size={18} />
        </button>

        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "0.5rem",
              border: "1px solid #ccc",
              maxHeight: "150px",
              overflowY: "auto",
              background: "white",
              position: "absolute",
              width: "100%",
              zIndex: 1000,
            }}
          >
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                onClick={() => handleSuggestionClick(s)}
                style={{ padding: "0.25rem", cursor: "pointer" }}
              >
                {formatAddress(s.address) || s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <MapContainer
        center={[12.5833, 121.5219]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
        />
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels & boundaries © Esri"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          setAddress={setAddress}
        />
        <MapViewUpdater position={position} />
      </MapContainer>

      <div className="button-group">
        <button className="submit-button" onClick={handleConfirm}>
          Confirm Location
        </button>
        <button className="submit-button cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default LocationPicker;
