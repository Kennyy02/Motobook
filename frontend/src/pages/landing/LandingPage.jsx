import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/landing/Header";
import { AuthContext } from "../../context/AuthContext";
import { Clock, UtensilsCrossed, ShieldCheck, Info, Store } from "lucide-react";
import "../../styles/landing/LandingPage.css";

const LandingPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "Customer") {
        navigate("/customer/home");
      } else if (user.role === "Seller") {
        navigate("/seller/business");
      } else if (user.role === "Rider") {
        navigate("/rider");
      } else if (user.role === "Admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="landing-container">
        <h1>Welcome to MotoBook!</h1>
        <p>Your favorite food delivery platform.</p>

        <section className="features">
          <div className="feature-card">
            <Clock size={40} className="feature-icon" />
            <h3>Fast Delivery</h3>
            <p>
              Get your favorite meals delivered in no time from nearby
              restaurants.
            </p>
          </div>
          <div className="feature-card">
            <UtensilsCrossed size={40} className="feature-icon" />
            <h3>Wide Selection</h3>
            <p>
              Browse a variety of cuisines and dishes from trusted local
              sellers.
            </p>
          </div>
          <div className="feature-card">
            <ShieldCheck size={40} className="feature-icon" />
            <h3>Secure Payments</h3>
            <p>
              Pay easily and securely through our integrated payment system.
            </p>
          </div>
        </section>

        <section className="how-it-works">
          <h2>
            <Info
              size={24}
              style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
            />
            How It Works
          </h2>
          <ol>
            <li>Sign up or log in to your MotoBook account.</li>
            <li>Browse restaurants and add items to your cart.</li>
            <li>Confirm your order and enjoy fast delivery to your door.</li>
          </ol>
        </section>

        <div className="seller-section">
          <h2>
            <Store
              size={24}
              style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
            />
            Are you a seller?
          </h2>
          <p>
            Join our platform to reach more customers and grow your business.
          </p>
          <button
            className="register-button"
            onClick={() => navigate("/seller/register")}
          >
            Register your shop here
          </button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
