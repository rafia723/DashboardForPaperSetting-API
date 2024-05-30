const express = require("express");
const { pool } = require("./database");

const gridviewWeightageRouter = express.Router();

gridviewWeightageRouter.get('/getGridViewWeightage/:clo_id', async (req, res) => {
  const clo_id = req.params.clo_id;
    const query = "SELECT * from Grid_View_Weightage where clo_id=?";
    pool.query(query,clo_id, (error, results) => {
      if (error) {
        console.error('Error fetching weightage :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });


  // To Get Grid_View_Weightage of Course
gridviewWeightageRouter.get("/getCourseGridViewWeightage/:c_id", (req, res) => {
  const c_id = req.params.c_id;
  const getQuery =
  ` SELECT gvwt.*, clo.c_id FROM Course JOIN clo ON Course.c_id = CLO.c_id JOIN Grid_View_Weightage gvwt 
    ON CLO.clo_id = gvwt.clo_id WHERE Course.c_id = ?; ` ;
  pool.query(getQuery, c_id, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
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