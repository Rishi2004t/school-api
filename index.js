require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection Configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Convert pool to support promises
const db = pool.promise();

// Test Connection and log status
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

// Basic Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the School Management API" });
});

app.get("/test", (req, res) => {
  res.send("API working");
});

// POST /addSchool - Add a new school
app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const latNum = Number(latitude);
  const lngNum = Number(longitude);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return res.status(400).json({ error: "Latitude and longitude must be numbers" });
  }

  try {
    const query = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(query, [name, address, latNum, lngNum]);

    res.status(201).json({
      message: "School added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error adding school:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function: Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadian = (angle) => (Math.PI / 180) * angle;
  const R = 6371; // Earth's radius in km

  const dLat = toRadian(lat2 - lat1);
  const dLon = toRadian(lon2 - lon1);
  const rLat1 = toRadian(lat1);
  const rLat2 = toRadian(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// GET /listSchools - List all schools sorted by distance
app.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  const userLat = Number(latitude);
  const userLng = Number(longitude);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const [schools] = await db.query("SELECT * FROM schools");

    const sortedSchools = schools
      .map((school) => ({
        ...school,
        distance: calculateDistance(userLat, userLng, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
