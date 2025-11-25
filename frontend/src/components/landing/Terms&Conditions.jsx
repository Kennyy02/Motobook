import React from "react";
import "../../styles/landing/TermsAndConditions.css"; // Import the CSS file

const TermsAndConditions = ({ onClose, onBackToSignup }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header with close button */}
        <div className="modal-header">
          <h1>Terms & Conditions</h1>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div className="modal-body">
          <p>
            Welcome to our application. By accessing or using our services, you
            agree to be bound by the following terms and conditions. Please read
            them carefully.
          </p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account or using our services, you acknowledge that
              you have read, understood, and agree to these terms. If you do not
              agree, you may not use our platform.
            </p>
          </section>

          <section>
            <h2>2. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and password. Any activity that occurs under your account
              is your responsibility.
            </p>
          </section>

          <section>
            <h2>3. Prohibited Activities</h2>
            <p>
              You agree not to misuse the platform in any way, including but not
              limited to hacking, spreading malware, or posting illegal content.
            </p>
          </section>

          <section>
            <h2>4. Limitation of Liability</h2>
            <p>
              We are not liable for any damages resulting from the use or
              inability to use our services. Use of the platform is at your own
              risk.
            </p>
          </section>

          <section>
            <h2>5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately once posted on this page.
            </p>
          </section>

          <p className="footer-note">
            If you have any questions about these terms, please contact our
            support team.
          </p>
        </div>

        {/* Footer button */}
        <div className="modal-footer">
          <button className="back-btn" onClick={onBackToSignup}>
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
