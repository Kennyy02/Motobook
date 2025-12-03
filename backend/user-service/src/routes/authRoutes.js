import express from "express";
import {
  loginUser,
  loginSeller,
  registerUser,
  googleLogin,
  verifyEmail,
  verifyCode,
  checkEmail,
  sendVerification,
  resendVerification,
  registerSeller,
  setUserPreferences,
  getUserPreferencesHandler,
  loginRider,
  getUsers,
  adminCreateUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getRiderProfile,
  updateRiderAvailability,
} from "../controller/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/google-login", googleLogin);
router.get("/verify-email", verifyEmail);
router.post("/verify-code", verifyCode);

router.post("/check-email", checkEmail);
router.post("/send-verification-code", sendVerification);
router.post("/resend-verification", resendVerification);
router.post("/register-seller", registerSeller);
router.post("/login-seller", loginSeller);

router.post("/preferences", setUserPreferences);
router.get("/preferences/:userId", getUserPreferencesHandler);

router.post("/rider/login", loginRider);
router.get("/rider/:id/profile", getRiderProfile);
router.patch("/rider/:id/availability", updateRiderAvailability);

router.get("/users", getUsers);
router.post("/users", adminCreateUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/password", changeUserPassword);

export default router;
