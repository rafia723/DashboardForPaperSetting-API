const express = require("express");
const { pool } = require("./database");

const Clo_Topic_MappingRouter = express.Router();

CloRouter.post("/addMappingofCloAndTopic", async (req, res) => {
    const {clo_id,t_id } = req.body;
    console.log("Data received:", { clo_id,t_id  });
    const insertQuery = "INSERT INTO Clo_Topic_Mapping ( clo_id,t_id  ) VALUES (?, ?)";
    const inserts = [clo_id,t_id ];
    pool.query(insertQuery, inserts, (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Data inserted successfully" });
    });
  });


module.exports = Clo_Topic_MappingRouter;