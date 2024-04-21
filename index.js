const express = require("express");
const facultyRoutes = require("./Faculty");
const courseRoutes = require("./Course");
const paperRoutes = require("./Paper");
const AssignedCoursesRoutes = require("./AssignedCourses");
const CloRouter = require("./Clo");
const TopicRouter = require("./Topic");
const Clo_Topic_MappingRouter = require("./Clo_Topic_Mapping");
const SubTopicRouter = require("./SubTopic");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/Faculty", facultyRoutes);
app.use("/Course", courseRoutes);
app.use("/Paper", paperRoutes);
app.use("/AssignedCourses", AssignedCoursesRoutes);
app.use("/Clo", CloRouter);
app.use("/Topic", TopicRouter);
app.use("/Clo_Topic_Mapping", Clo_Topic_MappingRouter);
app.use("/SubTopic", SubTopicRouter);

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});