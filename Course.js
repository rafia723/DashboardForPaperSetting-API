const express = require("express");
const { mysql, pool } = require("./database");

const courseRouter = express.Router();


courseRouter.get("/getCourse", (req, res) => {   //Datacell
  const getQuery = "SELECT * FROM Course";
  pool.query(getQuery, (err, result) => {
    if (err) {
      console.error("Error retrieving courses:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

courseRouter.get("/getCourseWithEnabledStatus", (req, res) => {  //HOD
  const getQueryWithEnabledStatus = "SELECT * FROM Course where status='enabled'";
  pool.query(getQueryWithEnabledStatus, (err, result) => {
    if (err) {
      // Handle database query error
      console.error("Error retrieving courses with enabled status:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

courseRouter.post("/addCourse", (req, res) => {    //Datacell
  const { c_code, c_title, cr_hours } = req.body;
  const status = "enabled";
  console.log("Data received:", { c_code, c_title, cr_hours });
  // SQL query to insert a new course
  const insertQuery = "INSERT INTO Course (c_code, c_title, cr_hours, status) VALUES (?, ?, ?, ?)";
  pool.query(insertQuery, [c_code, c_title, cr_hours, status], (err) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Post Request Error" });
    }
    console.log("Course inserted successfully");
    res.status(200).json({ message: "Course inserted successfully" });
  });
});

// EDIT endpoint
courseRouter.put("/editCourse/:c_id", (req, res) => {    //Datacell
  const userId = req.params.c_id;
  const { c_code, c_title, cr_hours } = req.body;
  // Validate course ID
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }
  // SQL query to update a course
  const updateQuery = "UPDATE Course SET c_code = ?, c_title = ?, cr_hours = ? WHERE c_id = ?";
  pool.query(updateQuery, [c_code, c_title, cr_hours, userId], (err, result) => {
    if (err) {
      console.error("Error updating course:", error);
      return res.status(500).json({ error: "Edit Request Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course updated successfully" });
  });
});


// EDIT STATUS endpoint
courseRouter.put("/editCourseStatus/:c_id", (req, res) => {     //Datacell
  const cId = req.params.c_id;
  if (!/^\d+$/.test(cId)) {
    return res.status(400).json({ error: "Invalid Course ID" });
  }
  // SQL query to fetch the current status of the course
  const getSingleRecordQuery = "SELECT * FROM Course WHERE c_id = ?";
  pool.query(getSingleRecordQuery, [cId], (fetchError, fetchResult) => {
    if (fetchError) {
      console.error("Error fetching course status:", fetchError);
      return res.status(500).json({ error: "Edit Status Request Error" });
    }
    if (fetchResult.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    const currentStatus = fetchResult[0].status;
    const newStatus = (currentStatus === "enabled") ? "disabled" : "enabled";
    // SQL query to update the status of the course
    const updateStatusQuery = "UPDATE Course SET status = ? WHERE c_id = ?";
    pool.query(updateStatusQuery, [newStatus, cId], (updateError, updateResult) => {
      if (updateError) {
        console.error("Error updating course status:", updateError);
        return res.status(500).json({ error: "Edit Status Request Error" });
      }
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.status(200).json({ message: "Course status updated successfully", newStatus });
    });
  });
});

// SEARCH endpoint
courseRouter.get("/searchCourseWithEnabledStatus", (req, res) => {   //HOD
  const searchQuery = req.query.search;
  if (!searchQuery) {
    return res.status(400).json({ error: "Missing search query parameter" });
  }
  // SQL query to search for courses with enabled status
  const searchCourseQueryWithEnabledStatus = "SELECT * FROM Course WHERE (c_code LIKE ? OR c_title LIKE ?) and status='enabled'";
  pool.query(searchCourseQueryWithEnabledStatus, [`%${searchQuery}%`, `%${searchQuery}%`], (err, searchResult) => {
    if (err) {
      console.error("Error searching course:", err);
      return res.status(500).json({ error: "Search Request Error" });
    }
    res.json(searchResult);
  });
});

// SEARCH endpoint
courseRouter.get("/searchCourse", (req, res) => {   //Datacell
  const searchQuery = req.query.search;
  if (!searchQuery) {
    return res.status(400).json({ error: "Missing search query parameter" });
  }
  // SQL query to search for courses
  const searchCourseQuery = "SELECT * FROM Course WHERE c_code LIKE ? OR c_title LIKE ?";
  pool.query(searchCourseQuery, [`%${searchQuery}%`, `%${searchQuery}%`], (err, searchResult) => {
    if (err) {
      console.error("Error searching course:", err);
      return res.status(500).json({ error: "Search Request Error" });
    }
    res.json(searchResult);
  });
});

module.exports = courseRouter;