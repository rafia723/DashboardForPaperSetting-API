const express = require("express");



const facultyRouter = require("./Faculty");
const courseRouter = require("./Course");
const paperRouter = require("./Paper");
const AssignedCoursesRouter = require("./AssignedCourses");
const CloRouter = require("./Clo");
const TopicRouter = require("./Topic");
const Clo_Topic_MappingRouter = require("./Clo_Topic_Mapping");
const SubTopicRouter = require("./SubTopic");
const questionRouter = require("./Question");
const sessionRouter = require("./Session");
const feedbackRouter = require("./Feedback");
const TopicTaughtRouter = require("./TopicTaught");
const gridviewHeaderRouter = require("./Gridview_Header");
const gridviewWeightageRouter = require("./GridView_Weightage");
const difficultyRouter = require("./Difficulty");
const QuestionTopicRouter = require("./QuestionTopic");



const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/Faculty", facultyRouter);
app.use("/Course", courseRouter);
app.use("/Paper", paperRouter);
app.use("/AssignedCourses", AssignedCoursesRouter);
app.use("/Clo", CloRouter);
app.use("/Topic", TopicRouter);
app.use("/Clo_Topic_Mapping", Clo_Topic_MappingRouter);
app.use("/SubTopic", SubTopicRouter);
app.use("/Question", questionRouter);
app.use('/Images', express.static('Images'));
app.use("/Session", sessionRouter);
app.use("/Feedback", feedbackRouter);
app.use("/TopicTaught", TopicTaughtRouter);
app.use("/Gridview_Header", gridviewHeaderRouter);
app.use("/GridView_Weightage", gridviewWeightageRouter);
app.use("/Difficulty", difficultyRouter);
app.use("/QuestionTopic",QuestionTopicRouter);


app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});