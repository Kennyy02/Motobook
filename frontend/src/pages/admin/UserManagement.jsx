import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/UserManagement.css";
import UserFormModal from "../../components/admin/UserFormModal";
import UserProfileModal from "../../components/admin/UserProfileModal";

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    passwordhash: "",
    phone: "",
    role: "",
  });
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const openProfileModal = (user) => {
    setSelectedUser(user);
    setProfileModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${userServiceBaseURL}/api/auth/users`
        // "/admin/users"
      );
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${userServiceBaseURL}/api/auth/users`,
        form
      );
      if (res.data) {
        setUsers((prev) => [...prev, res.data]);
      }
      resetForm();
      setModalOpen(false);
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      // Create a shallow copy of form
      const updatedData = { ...form };

      // Remove passwordhash if it's empty (no update to password)
      if (
        updatedData.passwordhash === undefined ||
        updatedData.passwordhash === null ||
        updatedData.passwordhash.trim() === ""
      ) {
        delete updatedData.passwordhash;
      }

      const res = await axios.put(
        `${userServiceBaseURL}/api/auth/users/${editId}`,
        updatedData
      );

      if (res.data) {
        const updatedUser = { ...form, userid: editId };
        setUsers((prev) =>
          prev.map((user) => (user.userid === editId ? updatedUser : user))
        );

        if (selectedUser && selectedUser.userid === editId) {
          setSelectedUser(updatedUser);
          setProfileModalOpen(true); // 👈 Reopen after update
        }
      }
      resetForm();
      setModalOpen(false);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (userid) => {
    try {
      await axios.delete(`${userServiceBaseURL}/api/auth/users/${userid}`);
      setUsers((prev) => prev.filter((user) => user.userid !== userid));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      passwordhash: "",
      phone: "",
      role: "",
    });
    setEditId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      passwordhash: "",
      phone: user.phone,
      role: user.role,
    });
    setEditId(user.userid);
    setModalOpen(true);
    setProfileModalOpen(false); // 👈 Close profile modal when editing
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <button onClick={openAddModal} className="add-user-btn">
        Add User
      </button>

      <UserFormModal
        isOpen={modalOpen}
        onClose={(wasEditing) => {
          setModalOpen(false);

          // 👇 Reopen the profile modal if user was editing and a user is selected
          if (wasEditing && selectedUser) {
            setProfileModalOpen(true);
          }
        }}
        form={form}
        setForm={setForm}
        onSubmit={editId ? handleUpdate : handleSubmit}
        editMode={!!editId}
      />

      <div className="user-list">
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.userid}
                  onClick={() => openProfileModal(user)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={selectedUser}
        onEdit={(user) => {
          openEditModal(user); // ✅ only open the form modal
          // ❌ Do NOT close profile modal
        }}
        onDelete={(userid) => {
          handleDelete(userid);
          setProfileModalOpen(false); // ✅ close after delete
        }}
      />
    </div>
  );
};

export default UserManagement;
