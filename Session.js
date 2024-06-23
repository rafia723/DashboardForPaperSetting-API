const express = require("express");
const { pool } = require("./database");

const sessionRouter = express.Router();

sessionRouter.get('/getActiveSession', async (req, res) => {
 
    const query = "SELECT * from Session where flag='active';";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching session :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });

  sessionRouter.get('/getSession', async (req, res) => {
 
    const query = "SELECT * from Session;";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching session :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });

  sessionRouter.post("/addSession", (req, res) => {
    const { s_name, year } = req.body;
    const status = "inactive";
  
    // Check if a session with the same s_name and year already exists
    const checkQuery = "SELECT COUNT(*) as count FROM Session WHERE s_name = ? AND year = ?";
    const checkValues = [s_name, year];
  
    pool.query(checkQuery, checkValues, (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error executing the query:", checkErr);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
  
      // If count is greater than 0, a session with the same s_name and year already exists
      if (checkResults[0].count > 0) {
        res.status(400).json({ error: "Session with the same name and year already exists" });
        return;
      }
  
      // Proceed with the insertion if no duplicate is found
      const insertQuery = "INSERT INTO Session (s_name, year, flag) VALUES (?, ?, ?)";
      const insertValues = [s_name, year, status];
  
      pool.query(insertQuery, insertValues, (insertErr) => {
        if (insertErr) {
          console.error("Error executing the query:", insertErr);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        res.status(200).json({ message: "Session added successfully" });
      });
    });
  });

  sessionRouter.put("/editSession/:s_id", (req, res) => {
    const sessionId = req.params.s_id;
    const { s_name, year } = req.body;
  
    // Check if another session with the same s_name and year exists
    const checkQuery = "SELECT COUNT(*) as count FROM Session WHERE s_name = ? AND year = ? AND s_id != ?";
    const checkValues = [s_name, year, sessionId];
  
    pool.query(checkQuery, checkValues, (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error executing the query:", checkErr);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
  
      // If count is greater than 0, another session with the same s_name and year exists
      if (checkResults[0].count > 0) {
        res.status(400).json({ error: "Another session with the same name and year already exists" });
        return;
      }
  
      // Proceed with the update if no duplicate is found
      const updateQuery = "UPDATE Session SET s_name = ?, year = ? WHERE s_id = ?";
      const updateValues = [s_name, year, sessionId];
  
      pool.query(updateQuery, updateValues, (updateErr, result) => {
        if (updateErr) {
          console.error("Error executing the query:", updateErr);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        if (result.affectedRows === 0) {
          res.status(404).json({ error: "Session record not found" });
          return;
        }
        res.status(200).json({ message: "Session record updated successfully" });
      });
    });
  });

  sessionRouter.put("/updateStatusOfSession/:s_id", (req, res) => {
    const sessionId = req.params.s_id;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          console.error("Error starting transaction:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        const activateSessionQuery = "UPDATE Session SET flag = 'active' WHERE s_id = ?";
        connection.query(activateSessionQuery, [sessionId], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error activating session:", err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
  
          if (result.affectedRows === 0) {
            return connection.rollback(() => {
              connection.release();
              res.status(404).json({ error: "Session record not found" });
            });
          }
  
          const deactivateOtherSessionsQuery = "UPDATE Session SET flag = 'inactive' WHERE s_id != ?";
          connection.query(deactivateOtherSessionsQuery, [sessionId], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error("Error deactivating other sessions:", err);
                res.status(500).json({ error: "Internal Server Error" });
              });
            }
  
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Error committing transaction:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                });
              }
  
              connection.release();
              res.status(200).json({ message: "Session status updated successfully" });
            });
          });
        });
      });
    });
  });
  


module.exports = sessionRouter;