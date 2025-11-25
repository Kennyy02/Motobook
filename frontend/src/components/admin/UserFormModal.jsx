import React, { useEffect, useState } from "react";
import "../../styles/admin/UserFormModal.css";

const UserFormModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  editMode,
}) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setRoles(["Customer", "Seller", "Rider"]);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{editMode ? "Edit User" : "Add User"}</h3>
        <form
          className="user-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g., john@example.com"
              required
            />
          </div>

          {!editMode && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.passwordhash || ""}
                onChange={(e) =>
                  setForm({ ...form, passwordhash: e.target.value })
                }
                placeholder="e.g., StrongPass@2024"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="phone-field">
              <span className="country-code">🇵🇭 +63</span>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="912 345 6789"
                value={form.phone || ""}
                onChange={(e) => {
                  const input = e.target;
                  const selectionStart = input.selectionStart;

                  // Extract digits and remove leading zero
                  let raw = e.target.value.replace(/\D/g, "");
                  if (raw.startsWith("0")) raw = raw.slice(1);
                  raw = raw.slice(0, 10);

                  // Unformatted cursor position tracking
                  let unformattedCursorIndex = 0;
                  for (let i = 0; i < selectionStart; i++) {
                    if (/\d/.test(e.target.value[i])) unformattedCursorIndex++;
                  }

                  // Format the phone number
                  const formatted = raw.replace(
                    /(\d{3})(\d{3})(\d{0,4})/,
                    (_, p1, p2, p3) => `${p1} ${p2}${p3 ? " " + p3 : ""}`
                  );

                  // Calculate new cursor position
                  let cursor = 0;
                  let digitsSeen = 0;
                  while (
                    digitsSeen < unformattedCursorIndex &&
                    cursor < formatted.length
                  ) {
                    if (/\d/.test(formatted[cursor])) {
                      digitsSeen++;
                    }
                    cursor++;
                  }

                  // Update form and cursor
                  setForm((prev) => ({ ...prev, phone: formatted }));
                  setTimeout(() => {
                    input.setSelectionRange(cursor, cursor);
                  }, 0);
                }}
                className="form-input no-padding"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">User Role</label>
            <select
              id="role"
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              <option value="" disabled>
                Select a role
              </option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit">{editMode ? "Update" : "Add"}</button>
            <button
              type="button"
              onClick={() => onClose(editMode)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
