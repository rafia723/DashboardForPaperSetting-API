const express = require("express");
const { pool } = require("./database");

const Clo_Topic_MappingRouter = express.Router();

Clo_Topic_MappingRouter.post("/addMappingsofCloAndTopic", async (req, res) => {
  const { tid, cloIds } = req.body;

  const insertQuery = "INSERT INTO Clo_Topic_Mapping (clo_id,t_id) VALUES (?, ?)";
  
  // Construct an array of arrays, each containing [clo_id, tid]
  const inserts = cloIds.map(cloId => [cloId, tid]);

  // Execute the insert query for each pair of clo_id and tid
  inserts.forEach(values => {
    pool.query(insertQuery, values, (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
    });
  });

  res.status(200).json({ message: "Data inserted successfully" });
});


Clo_Topic_MappingRouter.get("/getClosMappedWithTopic/:t_id", (req, res) => {  
  const t_id = req.params.t_id; 
  const getQuery = "SELECT * FROM Clo_Topic_Mapping WHERE t_id = ?";
  pool.query(getQuery,[t_id] ,(err, result) => {
    if (err) {
      console.error("Error retrieving Clos mapped with topic", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

Clo_Topic_MappingRouter.delete("/deleteMapping/:t_id/:clo_id", (req, res) => {
  const t_id = req.params.t_id;
  const clo_id = req.params.clo_id;

  const deleteQuery = "DELETE FROM Clo_Topic_Mapping WHERE t_id = ? AND clo_id = ?";
  pool.query(deleteQuery, [t_id, clo_id], (error, result) => {
    if (error) {
      console.error("Error deleting CLO mapping:", error);
      return res.status(500).json({ error: "Delete Request Error" });
    }
    res.status(200).json({ message: "CLO mapping deleted successfully" });
  });
});




module.exports = Clo_Topic_MappingRouter;

