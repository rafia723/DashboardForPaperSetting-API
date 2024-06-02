const express = require("express");
const { pool } = require("./database");

const CloRouter = express.Router();

CloRouter.post("/addClo", async (req, res) => {
  const { clo_text, c_id } = req.body;
  const status = "pending";

  // Query to get the maximum clo_number for the given c_id
  const getMaxCloNumberQuery = "SELECT MAX(clo_number) as max_clo_number FROM Clo WHERE c_id = ?";

  pool.query(getMaxCloNumberQuery, [c_id], (error, results) => {
    if (error) {
      console.error("Error retrieving max clo_number:", error);
      return res.status(500).json({ error: "Database Query Error" });
    }

    // Determine the new clo_number
    let newCloNumber = 1;
    if (results[0].max_clo_number !== null) {
      const maxCloNumber = parseInt(results[0].max_clo_number.split('-')[1]);
      newCloNumber = maxCloNumber + 1;
    }
    const clo_number = `CLO-${newCloNumber}`;

    // Query to insert the new Clo record
    const insertCloQuery = "INSERT INTO Clo (clo_text, c_id, status, clo_number) VALUES (?, ?, ?, ?)";
    const inserts = [clo_text, c_id, status, clo_number];

    pool.query(insertCloQuery, inserts, (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Clo inserted successfully" });
    });
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



  CloRouter.get('/getCloNumberofSpecificCloIds', (req, res) => {
    const clo_ids = req.query.clo_ids; // assuming the list is passed as a query parameter
    
    if (!clo_ids) {
      return res.status(400).send("No clo_ids provided");
    }
  
    // Convert clo_ids to an array if it's not already one
    const cloIdsArray = Array.isArray(clo_ids) ? clo_ids : clo_ids.split(',');
  
    // Construct the SQL query with the appropriate number of placeholders
    const placeholders = cloIdsArray.map(() => '?').join(',');
    const getQuery = `SELECT CAST(SUBSTRING_INDEX(clo_number, '-', -1) AS UNSIGNED) AS clo_number
    FROM clo
    WHERE clo_id IN (${placeholders})`;
  
    pool.query(getQuery, cloIdsArray, (err, result) => {
      if (err) {
        console.error("Error retrieving clos:", err);
        return res.status(500).send("Get Request Error");
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
    const cloId = req.params.clo_id;
    const { clo_text, c_id } = req.body;

    // SQL query to fetch the current status
    const getStatusQuery = "SELECT status FROM clo WHERE clo_id = ?";
    pool.query(getStatusQuery, [cloId], (err, result) => {
        if (err) {
            console.error("Error fetching CLO status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "CLO record not found" });
        }

        const currentStatus = result[0].status;

        // Check if the current status is disapproved
        if (currentStatus === "disapproved") {
            // SQL query to update the CLO
            const updateQuery = "UPDATE clo SET clo_text = ?, c_id = ?, status = 'pending' WHERE clo_id = ?";
            const updates = [clo_text, c_id, cloId];
            pool.query(updateQuery, updates, (err, result) => {
                if (err) {
                    console.error("Error updating CLO:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(200).json({ message: "CLO updated successfully" });
            });
        } else {
            // If status is pending or approved, update only clo_text and c_id without changing the status
            const updateQuery = "UPDATE clo SET clo_text = ?, c_id = ? WHERE clo_id = ?";
            const updates = [clo_text, c_id, cloId];
            pool.query(updateQuery, updates, (err, result) => {
                if (err) {
                    console.error("Error updating CLO:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(200).json({ message: "CLO updated successfully" });
            });
        }
    });
});


CloRouter.put("/updateCloStatus/:clo_id", (req, res) => {
  const CLOId = req.params.clo_id;
  let { status } = req.body;

  // Check if the provided status is valid
  if (status !== "approved" && status !== "disapproved") {
    return res.status(400).json({
      error: 'Invalid status value. Status must be either "approved" or "disapproved"',
    });
  }

  // Toggle the status
  status = status === "approved" ? "disapproved" : "approved";

  // Update the status in the database
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