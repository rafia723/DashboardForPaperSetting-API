const express = require("express");
const { sql, pool } = require("./database");

const AssignedCoursesRouter = express.Router();


// GET endpoint
AssignedCoursesRouter.get("/getAssignedCourses/:f_id", (req, res) => {
  const userId = req.params.f_id;
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  // SQL query to retrieve assigned courses for a faculty by ID
  const getAssignedCoursesQuery = `
    SELECT ac.ac_id, f.f_name AS TeacherName, c.c_title AS CourseTitle, c.c_code AS CourseCode
    FROM faculty f
    JOIN Assigned_Course ac ON f.f_id = ac.f_id
    JOIN course c ON ac.c_id = c.c_id
    WHERE f.f_id = ?`;
  pool.query(getAssignedCoursesQuery, [userId], (error, results) => {
    if (error) {
      console.error("Error getting assigned courses:", error);
      return res.status(500).json({ error: "Get Request Error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Data not found for the given ID" });
    }
    res.json(results);
  });
});

// GET endpoint
AssignedCoursesRouter.get("/getAssignedTo/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  if (!/^\d+$/.test(courseId)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }
  // SQL query to retrieve faculty assigned to a course by ID
  const getAssignedToQuery = `
    SELECT ac.ac_id, ac.c_id, ac.f_id, f.f_name AS TeacherName, c.c_title AS CourseTitle, c.c_code AS CourseCode, ac.role
    FROM faculty f
    JOIN Assigned_Course ac ON f.f_id = ac.f_id
    JOIN course c ON ac.c_id = c.c_id
    WHERE c.c_id = ?`;
  pool.query(getAssignedToQuery, [courseId], (error, results) => {
    if (error) {
      console.error("Error getting assigned faculty:", error);
      return res.status(500).json({ error: "Get Request Error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Data not found for the given ID" });
    }
    res.json(results);
  });
});

// POST endpoint
AssignedCoursesRouter.post("/addAssignedCourse", (req, res) => {
  const { c_id, f_id } = req.body;
  const role = "Junior";
  console.log("Data received:", { c_id, f_id, role });
  // SQL query to insert an assigned course
  const postQuery = "INSERT INTO Assigned_Course (c_id, f_id, role) VALUES (?, ?, ?)";
  pool.query(postQuery, [c_id, f_id, role], (error, results) => {
    if (error) {
      console.error("Error inserting data:", error);
      return res.status(500).json({ error: "Post Request Error" });
    }
    res.status(200).json({ message: "Assigned_Course inserted successfully" });
  });
});

// DELETE endpoint
AssignedCoursesRouter.delete("/deleteAssignedCourse/:ac_id", (req, res) => {
  const ac_id = req.params.ac_id;
  if (!/^\d+$/.test(ac_id)) {
    return res.status(400).json({ error: "Invalid assigned_course ID" });
  }
  // SQL query to delete an assigned course
  const deleteAssignedCourseQuery = "DELETE FROM Assigned_Course WHERE ac_id = ?";
  pool.query(deleteAssignedCourseQuery, [ac_id], (error, result) => {
    if (error) {
      console.error("Error deleting assigned course:", error);
      return res.status(500).json({ error: "Delete Request Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Assigned_Course not found" });
    }
    res.status(200).json({ message: "Assigned_Course deleted successfully" });
  });
});

// EDIT STATUS endpoint
AssignedCoursesRouter.put("/editRole/:c_id/:f_id", async (req, res) => {
  try {
    const c_id = req.params.c_id;
    const f_id = req.params.f_id;
    if (!/^\d+$/.test(c_id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    const editStatusQuery = 'UPDATE Assigned_Course SET role = CASE WHEN f_id = ? THEN "Senior" ELSE "Normal" END WHERE c_id = ?';
    pool.query(editStatusQuery, [f_id, c_id], (error, results) => {
      if (error) {
        console.error("Error updating Role:", error);
        return res.status(500).json({ error: "Edit Role Request Error" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Assigned Course not found" });
      }
      res.status(200).json({ success: "Role updated successfully" });
    });
  } catch (error) {
    console.error("Error updating Role:", error);
    res.status(500).json({ error: "Edit Role Request Error" });
  }
});

module.exports = AssignedCoursesRouter;