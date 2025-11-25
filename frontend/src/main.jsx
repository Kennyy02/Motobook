import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Modal from "react-modal";

// ✅ Set the app element for accessibility
Modal.setAppElement("#root");

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="1023403274598-s5af7lju6vva7e2aoqvp3185ke568r8n.apps.googleusercontent.com">
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>
);
