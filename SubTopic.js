const express = require("express");
const { pool } = require("./database");

const SubTopicRouter = express.Router();


SubTopicRouter.get("/getSubTopic/:t_id", (req, res) => {  
  const t_id = req.params.t_id; 
  const getQuery = "SELECT * FROM subTopic WHERE t_id = ?";
  pool.query(getQuery,[t_id] ,(err, result) => {
    if (err) {
      console.error("Error retrieving sub topics", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

SubTopicRouter.post("/addSubTopic", async (req, res) => {
    const { st_name,t_id } = req.body;
    const insertSubTopicQuery = "INSERT INTO subTopic (st_name, t_id) VALUES (?, ?)";
    const inserts = [st_name, t_id];
    pool.query(insertSubTopicQuery, inserts, (error,result) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Sub topic inserted successfully"});
    });
  });

  SubTopicRouter.put("/editSubTopic/:st_id", (req, res) => {    
    const stId = req.params.st_id;
    const { st_name,t_id } = req.body;

    const updateQuery = "UPDATE SubTopic SET st_name = ?, t_id = ? where st_id = ?";
    const updates = [st_name, t_id, stId]; 
    pool.query(updateQuery, updates, (err, result) => { 
        if (err) {
            console.error("Error updating topic:", err); 
            return res.status(500).json({ error: "update Request Error" });
        }
        res.status(200).json({ message: "Sub-topic updated successfully" });
    });
});


  


module.exports = SubTopicRouter;