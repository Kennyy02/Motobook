import Admin from "../model/adminModel.js";
import jwt from "jsonwebtoken";

// Get all admins (basic example)
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.getAll();
    res.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const admin = await Admin.findByCredentials(username, password);

    if (!admin || admin.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const user = admin[0]; // Assumes findByCredentials returns an array
    const role = "Admin"; // Explicitly define role

    // Sign JWT token with admin info
    const token = jwt.sign(
      { id: user.id, username: user.username, role },
      "LOGIN_KEY", // Replace with env var in production
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role, // Ensure role is included for ProtectedRoute
      },
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
