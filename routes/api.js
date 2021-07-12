const express = require("express");
const router = express.Router();

const db = require("../db/database");

const userRouter = require("./routers/users");
const groupRouter = require("./routers/group");
const fypRouter = require("./routers/fyp");
const submissionsRouter = require("./routers/submissions");

router.use([userRouter, groupRouter, fypRouter, submissionsRouter]);

module.exports = router;
