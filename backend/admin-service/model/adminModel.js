import { pool } from "../config/db.js";

const Admin = {
  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM admin_accounts");
    return rows;
  },

  findByCredentials: async (username, password) => {
    const query =
      "SELECT * FROM admin_accounts WHERE username = ? AND password = ?";
    const [rows] = await pool.query(query, [username, password]);
    return rows;
  },
};

export default Admin;
