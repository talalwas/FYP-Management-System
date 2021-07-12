const exjwt = require("express-jwt");
const express = require("express");
const process = require("process");
const ejwtauth = exjwt({
  secret: process.env.jwtsecret,
  algorithms: ["HS256"],
});

const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { processValidationErrors, APIError } = require("../../helpers/error");
const { param, body } = require("express-validator");
const Fyp = require("../../models/Fyp");
const Groups = require("../../models/Groups");
const ApplicationQueue = require("../../models/ApplicationQueue");
const { roles } = require("../../helpers/constants");

// get all ideas
router.get("/fyp/idea/students", ejwtauth, (req, res, next) => {
  const fyp = new Fyp();
  fyp
    .getStudentIdeas()
    .then((data) => {
      res.send(data);
    })
    .catch(next);
});

// get all supervisors ideas
router.get("/fyp/idea/faculty", ejwtauth, (req, res, next) => {
  const fyp = new Fyp();
  fyp
    .getFacultyIdeas()
    .then((data) => {
      res.send(data);
    })
    .catch(next);
});

// create an FYP idea.
router.post(
  "/fyp/idea",
  body("title").isString(),
  body("description").isString(),
  body("area").isString(),
  body("type").isString(),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    const fyp = new Fyp({
      created_by: req.user._id,
      title: req.body.title,
      description: req.body.description,
      area: req.body.area,
      type: req.body.type,
      /* attach user role */
      creator_role: req.user.role,
    });

    fyp
      .createFypIdea()
      .then((data) => {
        res.send(data);
      })
      .catch(next);
  }
);

// get applications for your FYP idea (from application queue)
// for supervisors: displays all the groups that want to work on your fyp idea
// for students: displays all the supervisors that want to supervise them
router.get(
  "/fyp/applications/",
  processValidationErrors,
  ejwtauth,
  async (req, res, next) => {
    // get all fyps with this user id
    const fyp = new Fyp({ created_by: req.user._id });
    fyp.getAllIdeasByUserId().then((allFyps) => {
      if (allFyps.length == 0) {
        res.send([]);
      } else {
        if (req.user.role == roles.S) {
          // student
          // for students its just one fyp
          myFyp = allFyps[0]._id;
          const appQueue = ApplicationQueue({ fyp: myFyp });
          appQueue
            .getSupervisors(req.user._id)
            .then((data) => res.send(data ? [data] : []))
            .catch(next);
        } else if (req.user.role == roles.F) {
          // faculty
          const allFypIds = allFyps.map((e) => e._id);
          const appQueue = ApplicationQueue();
          appQueue
            .getGroups(req.user._id, allFypIds)
            .then((data) => res.send(data))
            .catch(next);
        } else {
          new APIError(403, "You don't have access to this path.");
        }
      }
    });
  }
);

// get applications for your FYP idea (from application queue)
// for supervisors: displays all the groups that want to work on your fyp idea
// for students: displays all the supervisors that want to supervise them

router.get(
  /* :id is the FYP id */
  "/fyp/applications/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  ejwtauth,
  (req, res, next) => {
    const appQueue = ApplicationQueue({ fyp: req.params.id });
    if (req.user.role == roles.S) {
      // student
      appQueue
        .getSupervisors(req.user._id)
        .then((data) => res.send(data))
        .catch(next);
    } else if (req.user.role == roles.F) {
      // fac
      appQueue
        .getGroups(req.user._id)
        .then((data) => res.send(data))
        .catch(next);
    } else {
      next(new APIError(403, "You don't have access to this path."));
    }
  }
);

// apply to work on Supervisor's Idea
// TODO: put all this logic in the model. not here.
// we should only be calling a general method of applicationQueue here
// i think
router.put(
  /* :id is the FYP id */
  "/fyp/idea/apply/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  ejwtauth,
  (req, res, next) => {
    if (req.user.role == roles.S) {
      // apply to work on a Supervisor's FYP idea
      const group = new Groups();
      group
        .getGroupInfoByLeaderId(req.user._id)
        .then((data) => {
          if (data) {
            // try to add this group to possible candidates for the FYP
            const appQueue = new ApplicationQueue({
              fyp: req.params.id,
            });

            appQueue
              .addCandidateGroup(data._id)
              .then((_) => {
                res.sendStatus(204);
              })
              .catch(next);
          } else {
            // not a group leader
            throw new APIError(400, "Only Group Leaders can apply to ideas.");
          }
        })
        .catch(next);
    } else if (req.user.role == roles.F) {
      // apply to Supervise a group's FYP idea
      const appQueue = new ApplicationQueue({
        fyp: req.params.id,
      });
      appQueue
        .addCandidateSupervisor(req.user._id)
        .then((_) => {
          res.sendStatus(204);
        })
        .catch(next);
    } else {
      // any other user role (Comittee)
      next(new APIError(403, "You don't have access to this path."));
    }
  }
);

// for commattie get all the list of the in progress fyp
router.get("/fyp/get/allActive", ejwtauth, (req, res, next) => {
  if (req.user.role == roles.C) {
    const group = new Groups();
    group
      .getInProgressFyp()
      .then((result) => {
        res.send(result);
      })
      .catch(next);
  } else {
    // any other user role (Supervisor  , students)
    next(new APIError(403, "You don't have access to this path."));
  }
});

module.exports = router;
