// models/Order.js
import { pool } from "../../src/config/db.js";

export const createOrder = async (orderData, items) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders 
        (customer_id, customer_name, phone_number, delivery_address, latitude, longitude, restaurant_id, restaurant_name, total_amount, is_accepted, rider_id, rider_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderData.id,
        orderData.fullName,
        orderData.phoneNumber,
        orderData.address,
        orderData.latitude,
        orderData.longitude,
        orderData.restaurantId,
        orderData.restaurantName,
        orderData.totalAmount,
        false, // is_accepted default false
        null, // rider_id (initially null)
        null, // rider_name (initially null)
      ]
    );

    const orderId = orderResult.insertId;

    const itemInserts = items.map((item) => [
      orderId,
      item.id,
      item.productName,
      item.quantity,
      item.price,
      item.image || null,
    ]);

    await conn.query(
      `INSERT INTO order_items 
        (order_id, product_id, product_name, quantity, price, image) 
       VALUES ?`,
      [itemInserts]
    );

    await conn.commit();
    return { success: true, orderId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getOrdersByCustomer = async (customerId) => {
  const [orders] = await pool.query(
    `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`,
    [customerId]
  );

  for (const order of orders) {
    const [items] = await pool.query(
      `SELECT product_id, product_name, quantity, price, image 
       FROM order_items 
       WHERE order_id = ?`,
      [order.id]
    );

    order.items = items;
  }

  return orders;
};

export const updateOrderStatusInDB = async (orderId, status) => {
  const [result] = await pool.query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, orderId]
  );
  return result;
};

export const getAllPendingOrders = async () => {
  const [orders] = await pool.query(
    `SELECT * FROM orders WHERE status = 'pending' AND rider_id IS NULL`
  );

  for (const order of orders) {
    const [items] = await pool.query(
      `SELECT product_id, product_name, quantity, price, image 
       FROM order_items 
       WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;
  }

  return orders;
};

// ✅ Optional: Assign a rider (you can call this from the controller if needed)
export const assignRiderToOrder = async (orderId, riderId, riderName) => {
  const [result] = await pool.query(
    `UPDATE orders 
     SET is_accepted = TRUE, rider_id = ?, rider_name = ? 
     WHERE id = ?`,
    [riderId, riderName, orderId]
  );
  return result;
};

export const getAcceptedOrdersByRider = async (riderId) => {
  const [orders] = await pool.query(
    `SELECT * FROM orders WHERE is_accepted = TRUE AND rider_id = ? ORDER BY created_at DESC`,
    [riderId]
  );

  for (const order of orders) {
    const [items] = await pool.query(
      `SELECT product_id, product_name, quantity, price, image 
       FROM order_items 
       WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;
  }

  return orders;
};

export const markOrderAsCompleted = async (orderId) => {
  const [result] = await pool.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    ["completed", orderId]
  );
  return result;
};
