const express = require("express");
const bcrypt = require("bcrypt");
const { pool } = require("./database");

const saltRounds = 10;
const facultyRouter = express.Router();

const getFacultyNamesQuery = "SELECT f_id, f_name FROM Faculty";

// GET endpoint
facultyRouter.get("/getFaculty", (req, res) => {   //Datacell
  const getQuery = "SELECT * FROM Faculty";
  pool.query(getQuery, (err, result) => {
    if (err) {
      console.error("Error retrieving courses:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

facultyRouter.get("/getFacultyName/:f_id", (req, res) => {
  const f_id = req.params.f_id;
  const getQuery = "SELECT f_name FROM Faculty WHERE f_id = ?";
  pool.query(getQuery, [f_id], (err, result) => {
    if (err) {
      console.error("Error retrieving faculty:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    if (result.length === 0) {
      // If no faculty found with the provided f_id, send appropriate response
      res.status(404).send("Faculty not found");
      return;
    }
    res.json({ f_name: result[0].f_name }); // Send response as JSON object
  });
});

facultyRouter.post("/loginFaculty", (req, res) => {
  const { username, password } = req.body;

  const loginQuery = "SELECT * FROM faculty WHERE username = ?";

  pool.query(loginQuery, [username], async (error, results, fields) => {
    if (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login Error" });
      return;
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const { f_id,f_name, password: hashedPassword } = results[0];
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    res.status(200).json({ message: 'Login successful', fid:f_id ,fname:f_name});
  });
});

facultyRouter.get("/getFacultyWithEnabledStatus", (req, res) => {
  const getQueryWithEnabledStatus = "SELECT * FROM Faculty where status='enabled'";

  pool.query(getQueryWithEnabledStatus, (error, results) => {
    if (error) {
      console.error("Error during GET request:", error);
      res.status(500).send("Get Request Error");
      return;
    }

    res.json(results);
  });
});

// POST endpoint
facultyRouter.post("/addFaculty", async (req, res) => {
  const { f_name, username, password } = req.body;
  const status = "enabled";
  console.log("Data received:", { f_name, username, password, status });
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const postQuery = "INSERT INTO Faculty (f_name, username, password, status) VALUES (?, ?, ?, ?)";
  const inserts = [f_name, username, hashedPassword, status];

  pool.query(postQuery, inserts, (error) => {
    if (error) {
      console.error("Error inserting data:", error);
      return res.status(500).json({ error: "Post Request Error" });
    }
    res.status(200).json({ message: "Faculty inserted successfully" });
  });
});

// EDIT endpoint
facultyRouter.put("/editFaculty/:f_id", async (req, res) => {
  const fId = req.params.f_id;
  const { f_name, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  if (!/^\d+$/.test(fId)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const updateQuery = "UPDATE Faculty SET f_name = ?, username = ?, password = ? WHERE f_id = ?";
  const inserts = [f_name, username, hashedPassword, fId];
  pool.query(updateQuery, inserts, (error, results) => {
    if (error) {
      console.error("Error updating faculty:", error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Duplicate entry detected" });
      }
      return res.status(500).json({ error: "Edit Request Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    res.status(200).json({ message: "Faculty updated successfully" });
  });
});


// EDIT STATUS endpoint
facultyRouter.put("/editFacultyStatus/:f_id", async (req, res) => {
  const fId = req.params.f_id;
  if (!/^\d+$/.test(fId)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  // Fetch the current status of the faculty
  const getSingleRecordQuery = "SELECT * FROM Faculty WHERE f_id = ?";
  pool.query(getSingleRecordQuery, fId, async (error, fetchResult) => {
    if (error) {
      console.error("Error fetching faculty status:", error);
      return res.status(500).json({ error: "Edit Status Request Error" });
    }
    if (fetchResult.length === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    const currentStatus = fetchResult[0].status;
    let newStatus;
    if (currentStatus === "enabled") {
      newStatus = "disabled";
    } else if (currentStatus === "disabled") {
      newStatus = "enabled";
    }
    // Update the status of the faculty
    const updateStatusQuery = "UPDATE Faculty SET status = ? WHERE f_id = ?";
    pool.query(updateStatusQuery, [newStatus, fId], (updateError, updateResult) => {
      if (updateError) {
        console.error("Error updating faculty status:", updateError);
        return res.status(500).json({ error: "Edit Status Request Error" });
      }
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Faculty not found" });
      }
      res.status(200).json({ message: "Faculty status updated successfully", newStatus });
    });
  });
});

// SEARCH endpoint
facultyRouter.get("/searchFaculty", (req, res) => {
  const searchQuery = req.query.search;
  if (!searchQuery) {
    return res.status(400).json({ error: "Missing search query parameter" });
  }
  const searchFacultyQuery = "SELECT * FROM Faculty WHERE f_name LIKE ? OR username LIKE ?";
  pool.query(searchFacultyQuery, [`%${searchQuery}%`, `%${searchQuery}%`], (error, searchResult) => {
    if (error) {
      console.error("Error searching faculty:", error);
      return res.status(500).json({ error: "Search Request Error" });
    }
    res.json(searchResult);
  });
});
// SEARCH endpoint
facultyRouter.get("/searchFacultyWithEnabledStatus", (req, res) => {
  const searchQuery = req.query.search;
  if (!searchQuery) {
    return res.status(400).json({ error: "Missing search query parameter" });
  }
  const searchFacultyQueryWithEnabledStatus = "SELECT * FROM Faculty WHERE (f_name LIKE ? OR username LIKE ?) and status='enabled'";
  // Execute the SQL query
  pool.query(searchFacultyQueryWithEnabledStatus, [`%${searchQuery}%`, `%${searchQuery}%`], (error, searchResult) => {
    if (error) {
      console.error("Error searching faculty:", error);
      return res.status(500).json({ error: "Search Request Error" });
    }
    res.json(searchResult);
  });
});

module.exports = facultyRouter;
