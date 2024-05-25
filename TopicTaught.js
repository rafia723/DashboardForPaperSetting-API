const express = require("express");
const { sql, pool } = require("./database");

const TopicTaughtRouter = express.Router();

TopicTaughtRouter.post("/addTopicTaught", async (req, res) => {
    const { t_id, st_id, f_id } = req.body;

    const postQuery = "INSERT INTO TopicTaught (t_id, st_id, f_id) VALUES (?, ?, ?)";
    const inserts = [t_id, st_id, f_id];
  
    pool.query(postQuery, inserts, (error,results) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Post Request Error" });
      }
      res.status(200).json({ message: "Inserted",id:results.insertId });
    });
  });

  TopicTaughtRouter.delete("/deleteTopicTaught", async (req, res) => {
    const { tt_id } = req.body;

    const deleteQuery = "DELETE FROM TopicTaught WHERE tt_id=?";
    const del = [tt_id];
  
    pool.query(deleteQuery, del, (error) => {
      if (error) {
        console.error("Error deleting data:", error);
        return res.status(500).json({ error: "Delete Request Error" });
      }
      res.status(200).json({ message: "deleted" });
    });
});


TopicTaughtRouter.get("/getTopicTaught/:f_id", async (req, res) => {
  const f_id = req.params.f_id;

  const getQuery = `
      SELECT tt_id, t_id, st_id 
      FROM TopicTaught 
      WHERE f_id = ?
  `;
  pool.query(getQuery, [f_id], (error, results) => {
      if (error) {
          console.error("Error fetching data:", error);
          return res.status(500).json({ error: "Fetch Request Error" });
      }
      res.status(200).json(results);
  });
});


TopicTaughtRouter.get("/getcommonSubTopictaught/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const query =
  `        SELECT
  st.st_id,
  st.st_name,
  ac.c_id,
  COUNT(DISTINCT tt.f_id) AS num_faculty
FROM
  TopicTaught tt
JOIN
  subTopic st ON tt.st_id = st.st_id
JOIN
  Assigned_Course ac ON tt.f_id = ac.f_id
JOIN
  (SELECT c_id FROM Assigned_Course GROUP BY c_id HAVING COUNT(DISTINCT f_id) > 1) ac_mult ON ac.c_id = ac_mult.c_id
WHERE
  ac.c_id = ?
GROUP BY
  st.st_id, st.st_name, ac.c_id
HAVING
  COUNT(DISTINCT tt.f_id) = (
      SELECT COUNT(DISTINCT f_id)
      FROM Assigned_Course ac_inner
      WHERE ac_inner.c_id = ac.c_id
  )
ORDER BY
  st.st_id, ac.c_id;
  
   `;
  pool.query(query, [courseId],(err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});


module.exports = TopicTaughtRouter;