import express from "express";
import {
  registerRestaurant,
  fetchUserBusiness,
  updateBusinessLogo,
  createMenuItem,
  fetchMenuItemsByBusiness,
  toggleBusinessOpenState,
  fetchRecommendedRestaurants,
  fetchAllRestaurants,
  fetchBusinessLocations,
  fetchBusiness,
  changeBusinessStatus,
} from "../controller/businessController.js";
import { upload } from "../middleware/cloudinaryUpload.js";

const router = express.Router();

// ✅ TEST ROUTES - Add these first to verify routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Business service is working!" });
});

router.post("/test-upload", ...upload.single("testFile"), (req, res) => {
  console.log("Test upload hit");
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  if (req.file) {
    res.json({
      message: "Upload working!",
      file: req.file,
      cloudinaryUrl: req.file.path,
    });
  } else {
    res.status(400).json({ message: "No file uploaded" });
  }
});

//ADMIN
router.get("/business", fetchBusiness);
router.put("/business/:id/status", changeBusinessStatus);

router.get("/all-restaurants", fetchAllRestaurants);
router.get("/locations", fetchBusinessLocations);

router.post("/add", registerRestaurant);

// ✅ FIXED: Change from "/:userId" to "/user/:userId"
router.get("/user/:userId", fetchUserBusiness);

// ✅ FIXED: Spread the array returned by upload.single()
router.put("/logo/:userId", ...upload.single("logo"), updateBusinessLogo);
router.post(
  "/menu-add-items",
  ...upload.single("productImage"),
  createMenuItem
);

router.get("/menu-items/:businessId", fetchMenuItemsByBusiness);
router.put("/:id/open", toggleBusinessOpenState);

router.get("/recommended/:userId", fetchRecommendedRestaurants);

export default router;
