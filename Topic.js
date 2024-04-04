const express = require("express");
const { pool } = require("./database");

const TopicRouter = express.Router();

CloRouter.post("/addTopic", async (req, res) => {
    const { t_name,c_id } = req.body;
    console.log("Data received:", { t_name, c_id });
    const insertTopicQuery = "INSERT INTO Topic (t_name, c_id, ) VALUES (?, ?)";
    const inserts = [t_name, c_id, ];
    pool.query(insertTopicQuery, inserts, (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Topic inserted successfully" });
    });
  });


module.exports = TopicRouter;