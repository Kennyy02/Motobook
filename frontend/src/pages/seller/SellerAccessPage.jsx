import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/seller/SellerAccessPage.css";
import BusinessLocationPicker from "../../components/seller/BusinessLocationPicker";
import CategorySelectorModal from "../../components/seller/CategorySelectorModal";
import logo from "../../assets/logo/Motobook.png";

const SellerAccessPage = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";
  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

  const handleCategoryConfirm = (categories) => {
    setSelectedCategories(categories);
    setFormData((prev) => ({ ...prev, categories }));
    setCategoryModalOpen(false);
  };

  const [formData, setFormData] = useState({
    businessName: "",
    fullName: "",
    email: "",
    password: "",
    businessType: "",
    phone: "",
    address: "",
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLocationConfirm = (loc) => {
    setLocation(loc);
    setFormData((prev) => ({ ...prev, address: loc.address }));
  };

  const validateStep1 = () => {
    if (
      !formData.businessName.trim() ||
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.businessType ||
      !formData.phone.trim()
    ) {
      alert("Please fill in all required fields.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    const rawPhone = formData.phone.replace(/\s/g, "");
    if (!/^9\d{9}$/.test(rawPhone)) {
      alert(
        "Phone number must be 11 digits starting with 09 (e.g. 09123456789)."
      );
      return false;
    }

    if (!selectedCategories.length) {
      alert("Please select at least one category.");
      return false;
    }

    return true;
  };

  const handleGetStarted = (e) => {
    e.preventDefault();

    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      alert("Please enter or choose your business address.");
      return;
    }

    if (!location.lat || !location.lng) {
      alert("Please select a location using the map.");
      return;
    }

    const rawPhone = formData.phone.replace(/\s/g, "");

    try {
      const userRes = await axios.post(
        `${userServiceBaseURL}/api/auth/register-seller`,
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: `0${rawPhone}`,
          role: "Seller",
        }
      );

      const { token, user } = userRes.data;

      await axios.post(
        `${businessServiceBaseURL}/api/business/add`,
        {
          businessName: formData.businessName,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          businessType: formData.businessType,
          phone: `0${rawPhone}`,
          address: formData.address,
          latitude: location.lat,
          longitude: location.lng,
          userId: user.id,
          categories: selectedCategories,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Business registered successfully!");
      setFormData({
        businessName: "",
        fullName: "",
        email: "",
        password: "",
        businessType: "",
        phone: "",
        address: "",
      });
      setLocation({ lat: null, lng: null, address: "" });
      setStep(1);
      navigate("/seller/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
      console.error(error);
    }
  };

  const handleHomeClick = () => {
    // Force navigation to landing page and replace history
    navigate("/", { replace: true });
  };

  return (
    <div className="seller-register-wrapper">
      {/* Header */}
      <header className="seller-register-header">
        <img
          src={logo}
          alt="MotoBook Logo"
          className="header-logo"
          onClick={handleHomeClick}
        />
        <nav className="header-nav">
          <button className="nav-link" onClick={handleHomeClick}>
            Home
          </button>
          <button
            className="nav-link"
            onClick={() => navigate("/seller/login")}
          >
            Login
          </button>
          <button
            className="nav-link active"
            onClick={() => navigate("/seller/register")}
          >
            Sign Up
          </button>
        </nav>
      </header>

      {/* Content Area */}
      <div className="seller-register-content">
        <div className="seller-access-container">
          {step === 1 && (
            <form onSubmit={handleGetStarted} className="registration-form">
              <h3>Register Your Business</h3>

              <input
                className="form-input"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                name="fullName"
                placeholder="Owner's Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Business Type</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Grocery Store">Shop</option>
              </select>

              <div className="category-selector-wrapper">
                <label>Categories (up to 5):</label>
                <div className="selected-categories">
                  {selectedCategories.length > 0
                    ? selectedCategories.join(", ")
                    : "No categories selected."}
                </div>
                <button
                  type="button"
                  className="submit-button"
                  onClick={() => setCategoryModalOpen(true)}
                  style={{ marginTop: "8px" }}
                >
                  Select Categories
                </button>
              </div>

              <div className="phone-input-wrapper">
                <div className="phone-field">
                  <span className="country-code">+63</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="912 345 6789"
                    value={formData.phone}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      const formatted = raw.replace(
                        /(\d{3})(\d{3})(\d{0,4})/,
                        (_, p1, p2, p3) => `${p1} ${p2}${p3 ? " " + p3 : ""}`
                      );
                      setFormData((prev) => ({
                        ...prev,
                        phone: formatted,
                      }));
                    }}
                    className="form-input no-padding"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-button">
                Get Started
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="registration-form">
              <h3>Business Address</h3>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  className="form-input"
                  type="text"
                  name="address"
                  placeholder="Business Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="submit-button"
                  onClick={() => setMapModalOpen(true)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Choose from Map
                </button>
              </div>

              <button
                type="submit"
                className="submit-button"
                style={{ marginTop: "16px" }}
              >
                Register Business
              </button>
            </form>
          )}
        </div>
      </div>

      <BusinessLocationPicker
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onConfirm={handleLocationConfirm}
      />

      <CategorySelectorModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        selectedCategories={selectedCategories}
        onConfirm={handleCategoryConfirm}
      />
    </div>
  );
};

export default SellerAccessPage;
