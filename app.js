const express = require("express");
const path = require("path");
const logger = require("morgan");
const { handleErrors } = require("./helpers/error");
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const fileUpload = require("express-fileupload");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use("/", indexRouter);
app.use("/api", apiRouter);

/**
 * handle errors
 **/
app.use(handleErrors);

module.exports = app;
