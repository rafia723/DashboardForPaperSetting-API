const express = require("express");
const { sql, pool } = require("./database");

const TopicTaughtRouter = express.Router();

TopicTaughtRouter.post("/addTopicTaught", async (req, res) => {
  const { t_id, st_id, f_id } = req.body;

  // Query to fetch active session ID
  const getSessionQuery = "SELECT s_id FROM Session WHERE flag = 'active' LIMIT 1";

  // Execute query to fetch active session ID
  pool.query(getSessionQuery, (error, results) => {
    if (error) {
      console.error("Error fetching active session ID:", error);
      return res.status(500).json({ error: "Error fetching active session ID" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No active session found" });
    }

    const s_id = results[0].s_id;

    // Insert into TopicTaught table with fetched active session ID
    const insertQuery = "INSERT INTO TopicTaught (t_id, st_id, f_id, s_id) VALUES (?, ?, ?, ?)";
    const inserts = [t_id, st_id, f_id, s_id];

    pool.query(insertQuery, inserts, (error, results) => {
      if (error) {
        console.error("Error inserting data:", error);
        return res.status(500).json({ error: "Error inserting data into TopicTaught" });
      }
      res.status(200).json({ message: "Inserted", id: results.insertId });
    });
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
           SELECT tt.tt_id, tt.t_id, tt.st_id 
      FROM TopicTaught tt
      JOIN session s ON s.s_id=tt.s_id
      WHERE tt.f_id = ? AND s.flag='active';
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
  session s ON s.s_id = tt.s_id
WHERE
  ac.c_id = ?
  AND s.flag = 'active'
  AND ac.c_id IN (
    SELECT acc.c_id 
    FROM Assigned_Course acc
    JOIN session ss ON ss.s_id = acc.s_id
    WHERE ss.flag = 'active'
    GROUP BY acc.c_id 
    HAVING COUNT(DISTINCT acc.f_id) > 1
  )
GROUP BY
  st.st_id, st.st_name, ac.c_id
HAVING
  COUNT(DISTINCT tt.f_id) = (
    SELECT COUNT(DISTINCT ac_inner.f_id)
    FROM Assigned_Course ac_inner
    JOIN session s_inner ON s_inner.s_id = ac_inner.s_id
    WHERE ac_inner.c_id = ac.c_id
      AND s_inner.flag = 'active'
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


TopicTaughtRouter.get("/getcommonTopictaught/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const query =
  `        
  SELECT
  t.t_id,
  t.t_name,
  ac.c_id,
  COUNT(DISTINCT tt.f_id) AS num_faculty
FROM
  TopicTaught tt
  JOIN Topic t ON tt.t_id = t.t_id
  JOIN Assigned_Course ac ON tt.f_id = ac.f_id
  JOIN session s ON s.s_id = tt.s_id
WHERE
  s.flag = 'active'
  AND ac.c_id = ?
  AND ac.c_id IN (
    SELECT acc.c_id 
    FROM Assigned_Course acc
    JOIN session ss ON ss.s_id = acc.s_id
    WHERE ss.flag = 'active'
    GROUP BY acc.c_id 
    HAVING COUNT(DISTINCT acc.f_id) > 1
  )
GROUP BY
  t.t_id, t.t_name, ac.c_id
HAVING
  COUNT(DISTINCT tt.f_id) = (
    SELECT COUNT(DISTINCT ac_inner.f_id)
    FROM Assigned_Course ac_inner
    JOIN session s_inner ON s_inner.s_id = ac_inner.s_id
    WHERE ac_inner.c_id = ac.c_id
      AND s_inner.flag = 'active'
  )
ORDER BY
  t.t_id, ac.c_id;
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