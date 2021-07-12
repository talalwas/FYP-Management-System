const exjwt = require("express-jwt");
const express = require("express");
const process = require("process");
const uuid = require("uuid");
var appRoot = require("app-root-path");

const ejwtauth = exjwt({
  secret: process.env.jwtsecret,
  algorithms: ["HS256"],
});

const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { processValidationErrors, APIError } = require("../../helpers/error");
const { param, body } = require("express-validator");
const { roles, uploadsDir } = require("../../helpers/constants");
const { SubmissionEvent, Submission } = require("../../models/Submission");

// get all submission events
router.get("/submission/event", ejwtauth, (req, res, next) => {
  const subevent = SubmissionEvent();
  subevent
    .getEvents()
    .then((data) => {
      res.send(data);
    })
    .catch(next);
});

// create a new submission event
// would be hit by a faculty or committee member
// or maybe just only committee.
router.post(
  "/submission/event",
  body("title").isString(),
  body("deadline").isISO8601(),
  body("total_marks").isNumeric(),
  processValidationErrors,
  ejwtauth,
  (req, res, next) => {
    if (req.user.role == roles.C || req.user.role == roles.F) {
      // if a fac or committee member
      const subevent = SubmissionEvent({
        title: req.body.title,
        deadline: req.body.deadline,
        total_marks: req.body.total_marks,
        creator: req.user._id,
      });

      subevent
        .createEvent()
        .then((data) => {
          res.send(204);
        })
        .catch(next);
    } else {
      next(new APIError(403, "You don't have access to this path."));
    }
  }
);

// get all the submissions of a group
router.get(
  "/submission/:g_id",
  param("g_id", "Invalid Object ID") // group id
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    const submission = new Submission({ group: req.params.g_id });
    submission
      .getSubmissions(req.user._id)
      .then((data) => {
        res.send(data);
      })
      .catch(next);
  }
);

// create new submission by a group
router.post(
  "/submission/:se_id/:g_id",
  param("se_id", "Invalid Object ID") // submission event id
    .escape()
    .custom((value) => validateObjectID(value)),
  param("g_id", "Invalid Object ID") // group id
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    // req.files.subm must exist
    if (!req.files || !req.files.subm) {
      next(new APIError(400, "No submission file attached."));
    } else {
      const subm = req.files.subm;

      // prettier-ignore
      const uploadFilePath = `${appRoot}/${uploadsDir}/${uuid.v4()}-${subm.name}`;
      const submission = new Submission({
        submissionEvent: req.params.se_id,
        group: req.params.g_id,
        upload_path: uploadFilePath,
      });

      submission
        .createSubmission(req.user._id)
        .then((data) => {
          if (data) {
            // means we can safely move the file
            subm.mv(uploadFilePath, function (err) {
              if (err) {
                next(err);
              }
              res.sendStatus(204);
            });
          }
        })
        .catch(next);
    }
  }
);

// allow supervisor to mark a submission
router.post(
  "/submission/:se_id/:g_id/mark",
  param("se_id", "Invalid Object ID") // submission event id
    .escape()
    .custom((value) => validateObjectID(value)),
  param("g_id", "Invalid Object ID") // group id
    .escape()
    .custom((value) => validateObjectID(value)),
  body("marks").exists(),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    /* 
      allows a supervisor to grade a submission
      body must include a marks object of the following form:
      { marks : [
          { user: uuid(), obtained: 10 },
          { user: uuid(), obtained: 5 },
          ...
        ] 
      }
    */
    if (req.user.role == roles.F) {
      const subm = Submission({
        submissionEvent: req.params.se_id,
        group: req.params.g_id,
        marks: req.body.marks,
      });
      subm
        .markSubmission(req.user._id)
        .then((data) => res.sendStatus(204))
        .catch(next);
    } else {
      next(new APIError(403, "Only supervisors can mark submissions"));
    }
  }
);

// allow supervisor to change the submission status
router.post(
  "/submission/:se_id/:g_id/status",
  param("se_id", "Invalid Object ID") // submission event id
    .escape()
    .custom((value) => validateObjectID(value)),
  param("g_id", "Invalid Object ID") // group id
    .escape()
    .custom((value) => validateObjectID(value)),
  body("status").exists(),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    /* 
      allows a supervisor to change the submission status
      body must include a status object of the following form:
      { status : "accepted"
      }
    */
    if (req.user.role == roles.F) {
      const subm = Submission({
        submissionEvent: req.params.se_id,
        group: req.params.g_id,
        status: req.body.status,
      });
      subm
        .changeSubmissionStatus(req.user._id)
        .then((data) => res.sendStatus(204))
        .catch(next);
    } else {
      next(new APIError(403, "Only supervisors can change submission status"));
    }
  }
);

module.exports = router;
