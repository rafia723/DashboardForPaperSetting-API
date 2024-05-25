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
    SELECT ac.*, f.f_name , c.c_title , c.c_code 
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
    SELECT ac.*, f.f_name, f.f_id,c.c_title , c.c_code
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

// GET endpoint
AssignedCoursesRouter.get("/getUnAssignedCourses/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    const getUnAssignedCoursesQuery =
      "SELECT c.* FROM course c LEFT JOIN assigned_course ac ON c.c_id = ac.c_id AND ac.f_id = ? WHERE ac.ac_id IS NULL;";
    pool.query(getUnAssignedCoursesQuery, [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Query error" });
      }
      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: "Data not found for the given ID" });
      }
      res.json(result);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  }
});

// POST endpoint
AssignedCoursesRouter.post("/assignCourse/:c_id/:f_id", (req, res) => {
  const c_id = req.params.c_id;
  if (!/^\d+$/.test(c_id)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }
  const f_id = req.params.f_id;
  if (!/^\d+$/.test(f_id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const role = "junior";
  const session = 1;
  const query =
    "INSERT INTO Assigned_Course (c_id, f_id, role, s_id) VALUES (?, ?, ?, ?)";
  const values = [c_id, f_id, role, session];
  pool.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Course assigned successfully" });
  });
});

// EDIT STATUS endpoint
AssignedCoursesRouter.put("/editRole/:c_id/:f_id", async (req, res) => {
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
});

//DELETE endpoint
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

module.exports = AssignedCoursesRouter;