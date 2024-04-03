const express = require("express");
const { pool } = require("./database");

const CloRouter = express.Router();

CloRouter.post("/addClo", async (req, res) => {
    const { clo_text,c_id } = req.body;
    const status = "disapproved";
    console.log("Data received:", { clo_text, c_id, status });
    const insertCloQuery = "INSERT INTO Clo (clo_text, c_id, status) VALUES (?, ?, ?)";
    const inserts = [clo_text, c_id, status];
    pool.query(insertCloQuery, inserts, (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Clo inserted successfully" });
    });
  });

  CloRouter.get("/getClo/:c_id", (req, res) => {  
    const c_id = req.params.c_id; // Extract c_id from request parameters
    const getQuery = "SELECT * FROM CLO WHERE c_id = ?";
    pool.query(getQuery,[c_id] ,(err, result) => {
      if (err) {
        console.error("Error retrieving clos:", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });

  CloRouter.get("/getCloWithApprovedStatus/:c_id", (req, res) => {  
    const c_id = req.params.c_id; // Extract c_id from request parameters
    const getCloWithApprovedStatusQuery = "SELECT * FROM CLO WHERE c_id = ? and status='approved'";
    pool.query(getCloWithApprovedStatusQuery,[c_id] ,(err, result) => {
      if (err) {
        console.error("Error retrieving clos:", err);
        res.status(500).send("Get Request Error");
        return;
      }
      res.json(result);
    });
  });

  CloRouter.put("/editClo/:clo_id", (req, res) => {    
    const userId = req.params.clo_id;
    const status = "disapproved";
    const { clo_text,c_id } = req.body;
    // SQL query to update a course
    const updateQuery = "UPDATE clo SET clo_text = ?, c_id = ?, status = ? where clo_id = ?";
    const updates = [clo_text, c_id, status, userId]; // changed userId to clo_id
    pool.query(updateQuery, updates, (err, result) => { // removed the array brackets around updates
        if (err) {
            console.error("Error updating clo:", err); // corrected the error variable name
            return res.status(500).json({ error: "update Request Error" });
        }
        res.status(200).json({ message: "clo updated successfully" });
    });
});


CloRouter.put("/updateCloStatus/:clo_id", (req, res) => {
  const CLOId = req.params.clo_id;
  let { status } = req.body;
  if (status !== "approved" && status !== "disapproved") {
    return res.status(400).json({
      error:
        'Invalid status value. Status must be either "approved" or "disapproved"',
    });
  }
  if (status === "approved") {
    status = "disapproved";
  } else if (status === "disapproved") {
    status = "approved";
  }
  const query = "UPDATE clo SET status = ? WHERE clo_id = ?";
  const values = [status, CLOId];
  pool.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "CLO record not found" });
    }
    res.status(200).json({ message: "CLO status updated successfully" });
  });
});



module.exports = CloRouter;