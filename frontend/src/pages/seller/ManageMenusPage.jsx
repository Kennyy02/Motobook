import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // ✅ Import AuthContext
import "../../styles/seller/ManageMenusPage.css";

const businessServiceBaseURL =
  import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

const ManageMenusPage = () => {
  const { user } = useContext(AuthContext); // ✅ Get user from context
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // ✅ Use user.id from context with fallback to localStorage
        const userId = user?.id || localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        // ✅ Validate userId before making request
        if (!userId || userId === "null" || userId === "undefined") {
          console.error("❌ Invalid userId:", userId);
          alert("Unable to fetch menu items. Please log in again.");
          return;
        }

        console.log("✅ Fetching business for userId:", userId);

        const businessResponse = await axios.get(
          `${businessServiceBaseURL}/api/business/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const business = businessResponse.data;
        const businessId = business.id;

        console.log("✅ Business found:", business.businessName);

        const menuResponse = await axios.get(
          `${businessServiceBaseURL}/api/business/menu-items/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const items = menuResponse.data;

        // Organize products by category
        const grouped = {};
        const uniqueCategories = new Set();
        const allProducts = [];

        for (const item of items) {
          const product = {
            name: item.productName,
            price: item.price,
            description: item.description,
            image: item.image,
            category: item.category,
          };

          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push(product);
          uniqueCategories.add(item.category);
          allProducts.push(product);
        }

        // Add "All" category with all products
        grouped["All"] = allProducts;

        setCategories([...uniqueCategories]);
        setProductsByCategory(grouped);
        setSelectedCategory("All");
      } catch (error) {
        console.error("❌ Error fetching menu items:", error);
        alert(
          error.response?.data?.message ||
            "Failed to fetch menu items. Please check your connection and try again."
        );
      }
    };

    // ✅ Only fetch if user exists
    if (user?.id) {
      fetchMenuItems();
    }
  }, [user?.id]); // ✅ Add user.id as dependency

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewProduct((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleAddCategory = () => {
    setNewCategoryName("");
    setIsCategoryModalOpen(true);
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value === "__add_new__") {
      handleAddCategory();
    } else {
      setNewProduct({ ...newProduct, category: value });
    }
  };

  const handleAddProduct = async () => {
    const { name, price, description, image, category } = newProduct;
    if (!name || !price || !category || !image) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    setUploading(true);

    try {
      // ✅ Get userId from context with fallback
      const userId = user?.id || localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      // ✅ CRITICAL: Validate userId before sending
      if (!userId || userId === "null" || userId === "undefined") {
        alert("Session expired. Please log in again.");
        setUploading(false);
        return;
      }

      console.log("✅ Adding product for userId:", userId);

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("productName", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("productImage", image);

      // ✅ Log FormData contents for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? value.name : value);
      }

      const response = await axios.post(
        `${businessServiceBaseURL}/api/business/menu/add-items`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;
      console.log("✅ Product saved with ID:", data.id);

      const newEntry = {
        name,
        price,
        description,
        image: data.image,
        category,
      };

      if (!categories.includes(category)) {
        setCategories((prev) => [...prev, category]);
      }

      const updated = { ...productsByCategory };
      updated[category] = [...(updated[category] || []), newEntry];
      updated["All"] = [...(updated["All"] || []), newEntry];

      setProductsByCategory(updated);
      setSelectedCategory(category);
      resetForm();
      alert("Product added successfully!");
    } catch (error) {
      console.error("❌ Error saving product:", error);
      console.error("Error response:", error.response?.data);
      alert(
        error.response?.data?.message ||
          "Failed to add product. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (index) => {
    const productToEdit = productsByCategory[selectedCategory][index];
    setEditingIndex(index);
    setNewProduct({ ...productToEdit, category: selectedCategory });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    const { category } = newProduct;
    const updatedProducts = { ...productsByCategory };

    if (category !== selectedCategory) {
      updatedProducts[selectedCategory].splice(editingIndex, 1);
    }

    if (!updatedProducts[category]) updatedProducts[category] = [];
    updatedProducts[category].push(newProduct);

    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }

    setProductsByCategory(updatedProducts);
    setSelectedCategory(category);
    resetForm();
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
    });
    setIsModalOpen(true);
  };

  const handleConfirmAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories((prev) => [...prev, trimmedName]);
      setNewProduct((prev) => ({
        ...prev,
        category: trimmedName,
      }));
    } else if (trimmedName) {
      setNewProduct((prev) => ({
        ...prev,
        category: trimmedName,
      }));
    }
    setIsCategoryModalOpen(false);
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
    });
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const getSortedCategories = () => {
    const cats = Object.keys(productsByCategory).filter(
      (cat) => productsByCategory[cat] && productsByCategory[cat].length > 0
    );

    const filteredCats = cats.filter((cat) => cat !== "All");
    return ["All", ...filteredCats.sort()];
  };

  // ✅ Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="menus-page">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="menus-page">
      <h2>Manage Menus</h2>

      <button onClick={handleOpenAddModal} className="add-button">
        Add New
      </button>

      {/* Category Tabs */}
      <div className="category-tabs">
        {getSortedCategories().map((category) => (
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

      <hr />

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {editingIndex !== null ? "Edit Product" : "Add New Product"}
            </h3>
            <input
              name="name"
              value={newProduct.name}
              onChange={handleChange}
              placeholder="Food Name"
            />
            <input
              name="price"
              value={newProduct.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
            />
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <select value={newProduct.category} onChange={handleCategorySelect}>
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__add_new__">+ Add Category</option>
            </select>

            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <div className="modal-buttons">
              {editingIndex !== null ? (
                <button onClick={handleSaveEdit}>Save</button>
              ) : (
                <button onClick={handleAddProduct} disabled={uploading}>
                  {uploading ? "Uploading..." : "Add"}
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Add Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
            />
            <div className="modal-buttons">
              <button onClick={handleConfirmAddCategory}>Confirm</button>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Cards */}
      <div className="product-list">
        {(productsByCategory[selectedCategory] || []).map((prod, index) => (
          <div key={index} className="product-card">
            {prod.image && <img src={prod.image} alt={prod.name} />}
            <h3>{prod.name}</h3>
            <p>{prod.description}</p>
            <strong>₱{prod.price}</strong>
            <button onClick={() => handleEdit(index)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageMenusPage;
