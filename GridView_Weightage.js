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


gridviewWeightageRouter.get("/getCloWeightageofSpecificCourseAndHeaderName/:c_id/:name", (req, res) => {
  const c_id = req.params.c_id;
  const name = req.params.name;
  const getQuery =
  ` SELECT gvwt.*, clo.c_id,SUBSTRING(clo.clo_number, 5) AS clonumber FROM Course JOIN clo ON Course.c_id = CLO.c_id JOIN Grid_View_Weightage gvwt 
  ON CLO.clo_id = gvwt.clo_id join grid_view_headers gwh ON gvwt.header_id=gwh.header_id WHERE 
 Course.c_id =? AND gwh.name=? ;    ` ;
 const inserts=[c_id,name];
  pool.query(getQuery, inserts, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});


  // To Get Grid_View_Weightage of Course
  gridviewWeightageRouter.get("/getCourseGridViewWeightageWithSpecificHeader/:c_id/:header_id", (req, res) => {
    const c_id = req.params.c_id;
    const header_id = req.params.header_id;
    const getQuery = `
      SELECT gvwt.*, clo.c_id 
      FROM Course 
      JOIN clo ON Course.c_id = CLO.c_id 
      JOIN Grid_View_Weightage gvwt ON CLO.clo_id = gvwt.clo_id 
      WHERE Course.c_id = ? AND header_id = ?;
    `;
    const data = [c_id, header_id];
    pool.query(getQuery, data, (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      console.log("Query Results: ", results); // Log results
      res.json(results);
    });
  });


  gridviewWeightageRouter.post("/addGridViewWeightage", async (req, res) => {
    const { clo_id, header_id, weightage } = req.body;
   
    // Check if the combination of clo_id and header_id already exists
    const selectQuery = "SELECT * FROM grid_view_weightage WHERE clo_id = ? AND header_id = ?";
    const selectInserts = [clo_id, header_id];
    pool.query(selectQuery, selectInserts, (selectError, selectResult) => {
        if (selectError) {
            console.error("Error selecting data:", selectError);
            return res.status(500).json({ error: "Database Error" });
        }

        if (selectResult.length > 0) {
            // If the record exists, update the weightage
            const updateQuery = "UPDATE grid_view_weightage SET weightage = ? WHERE clo_id = ? AND header_id = ?";
            const updateInserts = [weightage, clo_id, header_id];
            pool.query(updateQuery, updateInserts, (updateError, updateResult) => {
                if (updateError) {
                    console.error("Error updating data:", updateError);
                    return res.status(500).json({ error: "Database Error" });
                }
                
                res.status(200).json({ message: "Updated successfully" });
            });
        } else {
            // If the record doesn't exist, insert a new one
            const insertQuery = "INSERT INTO grid_view_weightage (clo_id, header_id, weightage) VALUES (?, ?, ?)";
            const insertInserts = [clo_id, header_id, weightage];
            pool.query(insertQuery, insertInserts, (insertError, insertResult) => {
                if (insertError) {
                    console.error("Error inserting data:", insertError);
                    return res.status(500).json({ error: "Database Error" });
                }
                
                res.status(200).json({ message: "Inserted successfully" });
            });
        }
    });
});

  

module.exports = gridviewWeightageRouter;