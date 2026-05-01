const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import the database connection
const db = require('./db');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route to test the server
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express Node.js application.' });
});

// Example route to test the database connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({ 
        message: 'Database query successful',
        solution: rows[0].solution 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Add a new school
app.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate required fields
  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'All fields (name, address, latitude, longitude) are required.' });
  }

  // Validate latitude and longitude are numbers
  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  if (isNaN(latNum) || isNaN(lngNum)) {
    return res.status(400).json({ error: 'Latitude and longitude must be numbers.' });
  }

  try {
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [name, address, latNum, lngNum]);
    
    res.status(201).json({
      message: 'School added successfully.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ error: 'An error occurred while adding the school.' });
  }
});

// Helper function to calculate distance using Haversine formula (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadian = angle => (Math.PI / 180) * angle;
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = toRadian(lat2 - lat1);
  const dLon = toRadian(lon2 - lon1);
  const radLat1 = toRadian(lat1);
  const radLat2 = toRadian(lat2);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(radLat1) * Math.cos(radLat2);
  const c = 2 * Math.asin(Math.sqrt(a));
  
  return RADIUS_OF_EARTH_IN_KM * c;
}

// List all schools sorted by nearest
app.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Please provide both latitude and longitude query parameters.' });
  }

  const userLat = Number(latitude);
  const userLng = Number(longitude);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: 'Latitude and longitude must be valid numbers.' });
  }

  try {
    const [schools] = await db.query('SELECT * FROM schools');

    // Add distance to each school and sort
    const sortedSchools = schools.map(school => {
      const distance = calculateDistance(userLat, userLng, school.latitude, school.longitude);
      return { ...school, distance };
    }).sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'An error occurred while fetching the schools.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
