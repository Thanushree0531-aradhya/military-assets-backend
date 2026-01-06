const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Thanu@2004',
  database: 'military_assets',
  port: 5432,
});

module.exports = pool;
