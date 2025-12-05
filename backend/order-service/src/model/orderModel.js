// models/Order.js
import { pool } from "../../src/config/db.js";

export const createOrder = async (orderData, items) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders 
        (customer_id, customer_name, phone_number, delivery_address, latitude, longitude, restaurant_id, restaurant_name, total_amount, status, is_accepted, rider_id, rider_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        "pending", // ✅ Explicitly set initial status
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

// ✅ NEW: Update order to "preparing" status
export const setOrderPreparing = async (orderId) => {
  const [result] = await pool.query(
    `UPDATE orders SET status = 'preparing' WHERE id = ? AND status = 'pending'`,
    [orderId]
  );
  return result;
};

// ✅ NEW: Update order to "ready" status
export const setOrderReady = async (orderId) => {
  const [result] = await pool.query(
    `UPDATE orders SET status = 'ready' WHERE id = ? AND status = 'preparing'`,
    [orderId]
  );
  return result;
};

// ✅ MODIFIED: Only get orders with status 'ready' for riders
export const getAllPendingOrders = async () => {
  const [orders] = await pool.query(
    `SELECT * FROM orders WHERE status = 'ready' AND rider_id IS NULL ORDER BY created_at ASC`
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

export const getOrdersByRestaurant = async (restaurantId) => {
  const [orders] = await pool.query(
    `SELECT * FROM orders 
     WHERE restaurant_id = ? 
     ORDER BY 
       CASE 
         WHEN status = 'pending' THEN 1
         WHEN status = 'preparing' THEN 2
         WHEN status = 'ready' THEN 3
         WHEN status = 'accepted' THEN 4
         WHEN status = 'completed' THEN 5
         ELSE 6
       END,
       created_at DESC`,
    [restaurantId]
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

// ✅ MODIFIED: When rider accepts, update status to 'accepted' and set picked_up_at
export const assignRiderToOrder = async (orderId, riderId, riderName) => {
  const [result] = await pool.query(
    `UPDATE orders 
     SET is_accepted = TRUE, rider_id = ?, rider_name = ?, status = 'accepted', picked_up_at = NOW()
     WHERE id = ? AND status = 'ready'`,
    [riderId, riderName, orderId]
  );
  return result;
};

export const getAcceptedOrdersByRider = async (riderId) => {
  const [orders] = await pool.query(
    `SELECT * FROM orders 
     WHERE is_accepted = TRUE AND rider_id = ? AND status = 'accepted'
     ORDER BY created_at DESC`,
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
    "UPDATE orders SET status = 'completed', delivered_at = NOW() WHERE id = ?",
    [orderId]
  );
  return result;
};

export const getRiderDeliveryHistory = async (riderId) => {
  const [orders] = await pool.query(
    `SELECT * FROM orders 
     WHERE rider_id = ? AND status = 'completed'
     ORDER BY delivered_at DESC`,
    [riderId]
  );

  for (const order of orders) {
    const [items] = await pool.query(
      `SELECT product_id, product_name, quantity, price, image 
       FROM order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;
  }

  return orders;
};

export const getRiderStats = async (riderId) => {
  const [stats] = await pool.query(
    `SELECT 
      COUNT(*) as total_deliveries,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_deliveries,
      SUM(CASE WHEN status = 'completed' THEN rider_earnings ELSE 0 END) as total_earnings,
      SUM(CASE WHEN DATE(delivered_at) = CURDATE() AND status = 'completed' THEN rider_earnings ELSE 0 END) as today_earnings
     FROM orders 
     WHERE rider_id = ?`,
    [riderId]
  );

  return (
    stats[0] || {
      total_deliveries: 0,
      completed_deliveries: 0,
      total_earnings: 0,
      today_earnings: 0,
    }
  );
};
