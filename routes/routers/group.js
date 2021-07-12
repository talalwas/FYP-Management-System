const Group = require("./../../models/Groups");
const GroupRequest = require("./../../models/GroupRequests");
const { Submission } = require("./../../models/Submission");
const Message = require("./../../models/Message");
const exjwt = require("express-jwt");
const express = require("express");
const process = require("process");

const keys = {
  jwtsecret: process.env.jwtsecret,
};

const ejwtauth = exjwt({ secret: keys.jwtsecret, algorithms: ["HS256"] });
const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { decisions } = require("../../helpers/constants");
const { param } = require("express-validator");
const { processValidationErrors, APIError } = require("../../helpers/error");
const { roles } = require("../../helpers/constants");

/*
  --------
  CREATE a group (make empty group but make the requesting user leader)
  --------
*/

router.put(
  "/group/register",
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    const group = new Group({
      leader: req.user._id,
    });

    group
      .addGroup()
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.put(
  "/group/requestUser/:id",
  ejwtauth,
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    /* TODO: what about "type"
     * accept "type" as a parameter too,
     * but, for now, I think we are good.
     */

    if (req.user._id == req.params.id) {
      throw new APIError(400, "Really man?");
    }

    const groupReq = new GroupRequest({
      requested_by: req.user._id,
      requested_to: req.params.id,
    });

    groupReq
      .makeRequest()
      .then((data) => res.send(data))
      .catch(next);
  }
);

router.put(
  "/group/changeRequestStatus/:id/:decision",
  ejwtauth,
  param("decision").isString().isIn(Object.values(decisions)),
  // id is the groupRequest Id. returned from data from above route
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    const groupReq = new GroupRequest({
      _id: req.params.id,
      requested_to: req.user._id,
    });

    groupReq
      .changeRequestStatus(req.params.decision)
      .then(async (data) => {
        if (req.params.decision == decisions.A) {
          // add member to group
          const group = new Group({
            // requested_by will be the leader
            leader: data.requested_by,
          });
          await group.addGroupMember(req.user._id);
        }
        res.send(204);
      })
      .catch(next);
  }
);

router.get("/group/getMyRequests", ejwtauth, (req, res, next) => {
  const groupReq = new GroupRequest({
    requested_to: req.user._id,
  });

  groupReq
    .getAllRequestsToUser()
    .then((data) => res.send(data || []))
    .catch(next);
});

// Don't think we really need this, but why not
router.get("/group/getSentRequests", ejwtauth, (req, res, next) => {
  const groupReq = new GroupRequest({
    requested_by: req.user._id,
  });

  groupReq
    .getAllRequestsByUser()
    .then((data) => res.send(data || []))
    .catch(next);
});

router.get("/group/myGroup", ejwtauth, (req, res, next) => {
  /* get group associated with a user (whether they're a leader or a member) */
  const group = new Group();
  group
    .getGroupWithUserId(req.user._id)
    .then((data) => res.send(data))
    .catch(next);
});

router.get("/group/inSupervision", ejwtauth, (req, res, next) => {
  const group = new Group();
  group
    .getSupervisedGroups(req.user._id)
    .then((data) => res.send(data))
    .catch(next);
});

/*
  perspective: supervisor

  accept a group who has applied to work on your idea.

  **keep in mind** that this path would be hit only by a supervisor/Faculty
  because only they can choose who works on their idea.

  **note**. fyp_id has not been ASSIGNED to a group yet.
  after this, it will be (if everything is ok)
*/

router.put(
  "/group/accept/:fyp_id/:g_id",
  param("fyp_id", "Invalid Object ID") // FYP ID
    .escape()
    .custom((value) => validateObjectID(value)),
  param("g_id", "Invalid Object ID") // GROUP ID
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    if (req.user.role == roles.F) {
      // only supervisors can accept a group
      const group = new Group({
        _id: req.params.g_id,
        fyp_id: req.params.fyp_id,
      });

      group
        .acceptGroupForSupervisionAndRegisterFYP(req.user._id)
        .then((_) => {
          res.sendStatus(204);
        })
        .catch(next);
    } else {
      next(new APIError(403, "You don't have access to this path."));
    }
  }
);

/*
 perspective: student

 accept a supervisor that has applied to supervise a project
 s_id is supervisor ID

 **keep in mind** that this path would be hit only by a student
 since supervisors can only request to supervise a student
 project. Which means only student has the right to accept a supervisor.

 **note**. fyp_id has not been ASSIGNED to a group yet.
 after this, it will be (if everything is ok)
*/

router.put(
  "/group/accept/supervisor/:fyp_id/:s_id",
  param("fyp_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  param("s_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    if (req.user.role == roles.S) {
      const group = new Group({
        fyp_id: req.params.fyp_id,
        leader: req.user._id,
      });

      group
        .allowSupervisionAndRegisterFYP(req.params.s_id)
        .then((_) => {
          res.sendStatus(204);
        })
        .catch(next);
    } else {
      next(new APIError(403, "You don't have access to this path."));
    }
  }
);

router.put(
  "/group/delete/supervisor/:le_id/:g_id/:su_id",
  param("le_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  param("g_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  param("su_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    if (req.user.role == roles.F) {
      const group = new Group({});
      group
        .deletesupervisor(req.params.le_id, req.params.su_id, req.params.g_id)
        .then((_) => {
          // delete the group submissions also
          const submission = new Submission({ group: req.params.g_id });
          submission
            .deleteSubmissionByGroupId()
            .then((_) => {
              res.sendStatus(204);
            })
            .catch(next);
        })
        .catch(next);
    } else {
      next(new APIError(403, "You don't have access to this path."));
    }
  }
);

// change the status of fyp from the fyp commatie
router.put(
  `/group/status/fyp/change/:fyp_id/:g_id/:status`,
  param("fyp_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  param("g_id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    const group = new Group({ status: req.params.status });
    group
      .changeFypStatus(req.params.fyp_id, req.params.g_id)
      .then((_) => {
        res.sendStatus(204);
      })
      .catch(next);
  }
);

// get all group messages
router.get(
  `/group/messages/:g_id`,
  param("g_id", "Invalid Group ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  ejwtauth,
  (req, res, next) => {
    const message = new Message({
      sender: req.user._id,
      group: req.params.g_id,
    });

    message
      .getMessages()
      .then((data) => res.send(data))
      .catch(next);
  }
);

module.exports = router;
