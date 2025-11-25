import React, { useState, useEffect } from "react";
import "../../styles/admin/UserProfileModal.css";
import axios from "axios";

const UserProfileModal = ({ isOpen, onClose, user, onEdit, onDelete }) => {
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(null); // Optional success/error message

  useEffect(() => {
    if (!isOpen) {
      setChangingPassword(false);
      setMessage(null);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isOpen]);

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  if (!isOpen || !user) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      const res = await axios.put(
        `${userServiceBaseURL}/api/auth/users/${user.userid}/password`,
        {
          currentPassword,
          newPassword,
        }
      );

      if (res.data.success) {
        setMessage("Password changed successfully.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          setMessage(null);
          setChangingPassword(false);
        }, 1500);
      } else {
        setMessage(res.data.message || "Password change failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "An error occurred while changing password."
      );
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {!changingPassword ? (
          <>
            <h3 className="modal-title">User Profile</h3>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Address:</strong> {user.address || "N/A"}
            </p>

            <div className="profile-actions">
              <button className="edit" onClick={() => onEdit(user)}>
                Edit
              </button>
              <button className="delete" onClick={() => onDelete(user.userid)}>
                Delete
              </button>
              <button
                className="change-pwd"
                onClick={() => setChangingPassword(true)}
              >
                Change Password
              </button>
              <button className="close" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="change-password-title">Change Password</h3>
            <form
              className="change-password-form"
              onSubmit={handleChangePassword}
            >
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                placeholder="e.g., oldPass123"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
              />

              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="e.g., NewPass@2024"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
              />

              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />

              <div className="modal-actions">
                <button type="submit">Update Password</button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setMessage(null);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>

            {message && <p className="feedback-message">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
