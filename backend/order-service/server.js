import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import { checkConnections } from "./src/config/db.js";
import createAllTables from "./src/utils/orderUtils.js";
import orderRoutes from "./src/routes/orderRoutes.js";

// import seedCuisineCategories from "./src/utils/seedCuisineCategories.js";

import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file located outside admin-service (at backend/.env)
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/orders", orderRoutes);

const PORT = process.env.ORDER_PORT || 3004;

// app.use("/api/order", businessRoutes);

app.listen(PORT, async () => {
  console.log(chalk.green(`Server running on port ${PORT}`));

  try {
    await checkConnections();
    await createAllTables();
  } catch (error) {
    console.log(
      chalk.red("Failed to initialize Order-Service Database"),
      error
    );
  }
});
