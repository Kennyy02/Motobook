import { pool } from "../config/db.js";
import chalk from "chalk";

const ordersTableQuery = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    delivery_address TEXT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    restaurant_id INT NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'canceled', 'completed') DEFAULT 'pending',
    is_accepted BOOLEAN DEFAULT FALSE,
    rider_id INT,
    rider_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const orderItemsTableQuery = `
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),
    quantity INT,
    price DECIMAL(10,2),
    image TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`;

// Create individual table
const createTable = async (tableName, query) => {
  try {
    await pool.query(query);
    console.log(
      chalk.cyan(`${tableName} table is ready (created if not exists).`)
    );
  } catch (error) {
    console.log(chalk.red(`Error creating ${tableName} table:`, error));
    throw error;
  }
};

// Create all tables
const createAllTable = async () => {
  try {
    await createTable("orders", ordersTableQuery);
    await createTable("order_items", orderItemsTableQuery);
  } catch (error) {
    console.log(chalk.red("Error setting up tables."), error);
    throw error;
  }
};

export default createAllTable;
