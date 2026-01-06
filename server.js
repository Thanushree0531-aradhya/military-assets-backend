// server.js
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL pool
require("dotenv").config();

const app = express();

// ------------------ MIDDLEWARE ------------------

// Enable CORS so your frontend can call the backend
app.use(cors());

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------ ROUTES ------------------

// Import route files
const authRoutes = require("./routes/auth");           // login & signup
const dashboardRoutes = require("./routes/dashboard"); // dashboard stats
const purchasesRoutes = require("./routes/purchases");
const transfersRoutes = require("./routes/transfers");
const baseCommanderRoutes = require("./routes/baseCommander");
const assignmentsRouter = require('./routes/assignments');
const expendituresRouter = require("./routes/Expenditures"); // lowercase e



// Mount routes
app.use("/api/auth", authRoutes);                     // login & signup
app.use("/api/dashboard", dashboardRoutes);           // dashboard stats
app.use("/api/purchases", purchasesRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/base-commander", baseCommanderRoutes);
app.use('/api/assignments', assignmentsRouter);
app.use("/api/bases", require("./routes/bases"));
app.use("/api/expenditures", expendituresRouter);



// ------------------ TEST ROUTE ------------------
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Military Asset Management API is running!",
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







