const reqlib = require("app-root-path");
module.exports = {
  combinedLogFile: reqlib + "/logs/combined.log",
  errorLogFile: reqlib + "/logs/error.log",
  accessLogFile: reqlib + "/logs/access.log",
};
