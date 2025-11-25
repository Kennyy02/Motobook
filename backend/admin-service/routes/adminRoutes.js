import express from "express";
import { getAdmins, loginAdmin } from "../controllers/adminControllers.js";

const router = express.Router();

router.get("/login", getAdmins);
router.post("/login", loginAdmin);

export default router;
