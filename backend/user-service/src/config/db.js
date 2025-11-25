import chalk from "chalk";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

// DB config using environment variables (Railway provides these)
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "railway",
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || "3306"),
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
};

// Log configuration (hide password for security)
console.log(chalk.blue("\n=== User Service Database Config ==="));
console.log(chalk.blue(`Host: ${dbConfig.host}`));
console.log(chalk.blue(`Port: ${dbConfig.port}`));
console.log(chalk.blue(`User: ${dbConfig.user}`));
console.log(chalk.blue(`Database: ${dbConfig.database}`));
console.log(
  chalk.blue(`Password: ${dbConfig.password ? "***SET***" : "***NOT SET***"}`)
);
console.log(chalk.blue("====================================\n"));

// Function to wait/sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to test database connection with retry logic
const testConnection = async (maxRetries = 10, delay = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        chalk.yellow(
          `[Attempt ${attempt}/${maxRetries}] Testing database connection...`
        )
      );

      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
      });

      console.log(chalk.green("✓ Successfully connected to database"));
      await connection.end();
      return true;
    } catch (error) {
      console.error(chalk.red(`✗ Connection attempt ${attempt} failed:`));
      console.error(chalk.red(`  Error: ${error.message}`));
      console.error(chalk.red(`  Code: ${error.code}`));

      if (attempt < maxRetries) {
        console.log(chalk.yellow(`  Retrying in ${delay / 1000} seconds...\n`));
        await sleep(delay);
      } else {
        console.error(
          chalk.red(`\n✗ Failed to connect after ${maxRetries} attempts`)
        );
        console.error(chalk.red("\nPlease check:"));
        console.error(chalk.red("  1. MySQL service is running on Railway"));
        console.error(
          chalk.red("  2. Environment variables are correctly set")
        );
        console.error(
          chalk.red("  3. Database exists and credentials are correct\n")
        );
        throw error;
      }
    }
  }
};

// Create pool
let pool;

try {
  // Test the connection before creating the pool
  await testConnection();

  // Create the connection pool
  pool = mysql.createPool(dbConfig);
  console.log(chalk.green("✓ Database connection pool created\n"));
} catch (error) {
  console.error(chalk.red("✗ CRITICAL: Failed to initialize database"));
  console.error(
    chalk.red("The application will start but database operations will fail.\n")
  );
  pool = null;
}

// Check DB connection (used in server.js)
export const checkConnections = async () => {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }

  try {
    const connection = await pool.getConnection();
    console.log(
      chalk.green("✓ User-Service Database connection pool is working")
    );
    connection.release();
    return true;
  } catch (error) {
    console.log(chalk.red("✗ Error getting connection from pool"));
    throw error;
  }
};

// Export pool
export { pool };
