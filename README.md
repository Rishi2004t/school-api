# 🚀 School Management API

## 📌 Project Overview
The School Management API is a robust backend service designed to manage school data efficiently. It provides functionalities to register new schools with their geographical coordinates and seamlessly retrieve a list of schools sorted by their proximity to a user's current location. This is highly applicable for real-world use cases like educational directories, local school finders, and student enrollment systems.

## ✨ Features
* **Add School API:** Register new schools with essential details (name, address, latitude, longitude).
* **List Schools by Distance:** Fetch a dynamically sorted list of schools based on their distance from a specified geographic point.
* **Input Validation:** Ensures all incoming data is clean, formatted, and strictly adheres to expected types before processing.
* **Distance Calculation:** Accurately computes the shortest distance between two points on the Earth's surface using the Haversine formula.

## 🛠️ Tech Stack
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
* **MySQL:** Relational database management system for secure and structured data storage.
* **Postman:** API testing and development tool.

## 📁 Project Structure
```text
📦 project-root
 ┣ 📜 index.js    # Entry point of the application, sets up Express server and routes.
 ┣ 📜 db.js       # Database configuration and connection pool setup using MySQL2.
 ┣ 📜 .env        # Environment variables for secure configuration (not committed).
 ┣ 📜 .gitignore  # Specifies intentionally untracked files to ignore.
 ┗ 📜 package.json# Project metadata and dependencies.
```

## ⚙️ Installation
Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <project-folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   Execute the SQL script provided in the database setup section to create the required tables.

4. **Start the server:**
   ```bash
   npm start
   # or for development mode
   npm run dev
   ```

## 🔐 Environment Variables
Create a `.env` file in the root directory and add the following configuration:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_db
```

## 🗄️ Database Setup
Run the following SQL query in your MySQL database to create the necessary table:

```sql
CREATE DATABASE IF NOT EXISTS school_db;
USE school_db;

CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 API Endpoints

### 1. Add a New School
* **Endpoint:** `POST /addSchool`
* **Description:** Adds a new school to the database.

**Request Example (JSON):**
```json
{
  "name": "Greenwood High",
  "address": "123 Education Lane, Cityville",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Response Example (Success):**
```json
{
  "message": "School added successfully",
  "schoolId": 1
}
```

### 2. List Schools by Distance
* **Endpoint:** `GET /listSchools`
* **Description:** Retrieves all schools, sorted by distance from the provided coordinates.

**Query Parameters:**
* `lat` (float): User's latitude.
* `lng` (float): User's longitude.

**Request Example:**
`GET /listSchools?lat=34.0500&lng=-118.2500`

**Response Example (Success):**
```json
[
  {
    "id": 1,
    "name": "Greenwood High",
    "address": "123 Education Lane, Cityville",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "distance": 1.25 
  }
]
```
*(Distance is typically returned in kilometers or miles, depending on the implementation).*

## 📏 Distance Logic (Haversine Formula)
To sort the schools by proximity, the API utilizes the **Haversine formula**. This mathematical formula calculates the shortest distance between two points on a sphere using their latitudes and longitudes. It is highly accurate for distances on the Earth's surface, making it perfect for finding the nearest schools to a user's specific location.

## 🧪 Testing
You can easily test the API endpoints using **Postman**:
1. Open Postman and create a new request.
2. **For adding a school:** Set method to `POST`, enter `http://localhost:3000/addSchool`, go to the `Body` tab, select `raw` and `JSON`, paste the request example, and hit Send.
3. **For listing schools:** Set method to `GET`, enter `http://localhost:3000/listSchools?lat=YOUR_LAT&lng=YOUR_LNG`, and hit Send.

## 🚀 Future Improvements
* **Authentication:** Implement JWT (JSON Web Tokens) to secure the API and restrict access to authorized users.
* **Frontend:** Develop a modern React.js or Vue.js frontend application to interact with this API.
* **Deployment:** Containerize the application with Docker and deploy it to a cloud provider like AWS, Heroku, or Render.

## 👨‍💻 Author
**Rishi Dhanaji Dange**
