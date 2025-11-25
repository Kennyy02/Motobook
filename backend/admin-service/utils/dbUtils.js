import { pool } from "../config/db.js";
import chalk from "chalk";

const admin_accounts_TableQuery = `CREATE TABLE IF NOT EXISTS admin_accounts (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) DEFAULT NULL,
  password VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id)
);`;

const createTable = async (tableName, query) => {
  try {
    await pool.query(query);
    console.log(
      chalk.cyan(`${tableName} table is ready (created if not exists).`)
    );
  } catch (error) {
    console.log(chalk.red(`Error ensuring ${tableName} table exists.`));
    throw error;
  }
};

const createAllTable = async () => {
  try {
    await createTable("Admin_Accounts", admin_accounts_TableQuery);
  } catch (error) {
    throw error;
  }
};

export default createAllTable;
