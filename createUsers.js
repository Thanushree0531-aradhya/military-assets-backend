const bcrypt = require("bcrypt");
const db = require("./db"); // your db.js connection

async function createUsers() {
  try {
    const users = [
      { name: "Admin User", email: "admin@gmail.com", password: "Admin@123", role: "ADMIN" },
      { name: "Base Commander", email: "commander@gmail.com", password: "Commander@123", role: "BASE_COMMANDER", base_id: 1 },
      { name: "Logistics Officer", email: "logistics@gmail.com", password: "Logistics@123", role: "LOGISTICS_OFFICER" }
    ];

    for (const user of users) {
      const hashed = await bcrypt.hash(user.password, 10);
      await db.query(
        `INSERT INTO users (name, email, password, role, base_id) VALUES ($1,$2,$3,$4,$5)`,
        [user.name, user.email, hashed, user.role, user.base_id || null]
      );
      console.log(`Created user: ${user.email}`);
    }

    console.log("All users created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating users:", err);
    process.exit(1);
  }
}

createUsers();
