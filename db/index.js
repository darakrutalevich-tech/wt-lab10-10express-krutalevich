const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL
    || "postgresql://postgres:12345@localhost:5432/wt_lab8";

const pool = new Pool({ connectionString });

module.exports = pool;