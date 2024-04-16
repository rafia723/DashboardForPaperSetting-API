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


module.exports = Clo_Topic_MappingRouter;

