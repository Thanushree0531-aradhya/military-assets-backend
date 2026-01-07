const { Pool } = require('pg');

let pool;

// ✅ If running on Render / Production
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} 
// ✅ Else use local database (your existing setup)
else {
  pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'Thanu@2004$',
    database: 'military_assets',
    port: 5432,
  });
}

module.exports = pool;

