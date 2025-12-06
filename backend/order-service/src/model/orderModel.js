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

// Fixed getSellerStats function for orderModel.js

export const getSellerStats = async (restaurantId) => {
  const conn = await pool.getConnection();

  try {
    console.log("📊 Fetching stats for restaurant ID:", restaurantId);

    // First, verify the restaurant exists and has orders
    const [checkRestaurant] = await conn.query(
      `SELECT COUNT(*) as total FROM orders WHERE restaurant_id = ?`,
      [restaurantId]
    );

    console.log("Total orders for this restaurant:", checkRestaurant[0].total);

    // Query for all statistics in one go for better performance
    const [stats] = await conn.query(
      `SELECT 
        -- Total orders today
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as total_orders_today,
        
        -- Pending orders (pending + preparing + ready - not yet picked up)
        COUNT(CASE WHEN status IN ('pending', 'preparing', 'ready') THEN 1 END) as pending_orders,
        
        -- Completed orders today
        COUNT(CASE WHEN status = 'completed' AND DATE(delivered_at) = CURDATE() THEN 1 END) as completed_today,
        
        -- Total revenue today (completed orders only)
        COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(delivered_at) = CURDATE() THEN total_amount ELSE 0 END), 0) as revenue_today,
        
        -- All time stats
        COUNT(*) as total_orders_all_time,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_all_time,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as revenue_all_time
       
       FROM orders 
       WHERE restaurant_id = ?`,
      [restaurantId]
    );

    console.log("📊 Basic stats:", stats[0]);

    // Query for top-selling item
    const [topItem] = await conn.query(
      `SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_sold
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.restaurant_id = ? AND o.status = 'completed'
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC
       LIMIT 1`,
      [restaurantId]
    );

    console.log("🏆 Top item:", topItem[0]);

    // Query for average preparation time (last 7 days)
    // Calculate from order creation to delivery completion
    const [avgPrepTime] = await conn.query(
      `SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, created_at, delivered_at)) as avg_prep_minutes
       FROM orders 
       WHERE restaurant_id = ? 
         AND status = 'completed' 
         AND delivered_at IS NOT NULL
         AND created_at IS NOT NULL
         AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAYS)`,
      [restaurantId]
    );

    console.log("⏱️ Avg prep time:", avgPrepTime[0]);

    const result = {
      // Today's statistics
      totalOrdersToday: parseInt(stats[0].total_orders_today) || 0,
      pendingOrders: parseInt(stats[0].pending_orders) || 0,
      completedToday: parseInt(stats[0].completed_today) || 0,
      revenueToday: parseFloat(stats[0].revenue_today) || 0,

      // Top selling item
      topSellingItem: topItem[0]?.product_name || "N/A",
      topSellingItemQuantity: parseInt(topItem[0]?.total_sold) || 0,

      // Average prep time (last 7 days) - rounded to nearest minute
      avgPrepTime: Math.round(
        parseFloat(avgPrepTime[0]?.avg_prep_minutes) || 0
      ),

      // All time stats
      totalOrdersAllTime: parseInt(stats[0].total_orders_all_time) || 0,
      completedAllTime: parseInt(stats[0].completed_all_time) || 0,
      revenueAllTime: parseFloat(stats[0].revenue_all_time) || 0,
    };

    console.log("✅ Final result:", result);
    return result;
  } catch (err) {
    console.error("❌ Error fetching seller stats:", err);
    console.error("Error details:", err.message);
    console.error("Error stack:", err.stack);
    throw err;
  } finally {
    conn.release();
  }
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
