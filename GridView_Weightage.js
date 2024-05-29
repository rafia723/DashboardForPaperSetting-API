const express = require("express");
const { pool } = require("./database");

const gridviewWeightageRouter = express.Router();

gridviewWeightageRouter.get('/getGridViewWeightage', async (req, res) => {
 
    const query = "SELECT * from GridView_Weightage";
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching weightage :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });


  gridviewWeightageRouter.post("/addGridViewWeightage", async (req, res) => {
    const { clo_id,header_id,weightage } = req.body;
   
    const insertQuery = "INSERT INTO grid_view_weightage (clo_id, header_id,weightage) VALUES (?, ?,?)";
    const inserts = [clo_id, header_id,weightage];
    pool.query(insertQuery, inserts, (error,result) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      
      res.status(200).json({ message: "Inserted successfully"});
    });
  });


module.exports = gridviewWeightageRouter;