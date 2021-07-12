const mongoose = require("mongoose");
const validator = require("validator");
const { APIError } = require("../helpers/error");
const { roles, decisions } = require("../helpers/constants");
const Fyp = require("./Fyp");
const Groups = require("./Groups");

// single global submission event
// this way faculty only has to create One object in database
// that all other groups can see.
// -- because submission events are same for everyone --
const submissioneventschema = mongoose.Schema(
  {
    title: String,
    deadline: Date,
    available: {
      // might not need this
      type: Boolean,
      default: true,
    },
    total_marks: Number,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamp: true }
);

// group submissions attached to that submission event
const groupsubmissionschema = mongoose.Schema(
  {
    submissionEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubmissionEvent",
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    upload_path: String,
    marks: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        obtained: Number,
      },
    ],
    status: {
      type: String,
      enum: [decisions.A, decisions.R, decisions.P],
      default: decisions.P,
    },
  },
  { timestamp: true }
);

submissioneventschema.method("getEvents", function () {
  return this.model("SubmissionEvent")
    .find({
      available: true,
      // only get events with deadline in the future
      deadline: { $gte: new Date() },
    })
    .sort("deadline");
});

submissioneventschema.method("createEvent", function () {
  return this.model("SubmissionEvent").create(this);
});

groupsubmissionschema.method("getSubmissions", async function (u_id) {
  // check if user is part of the group that they're making query for
  // or a supervisor for that group.
  const res = await Groups.findOne().or([
    { group_members: u_id },
    { supervisor: u_id },
    { leader: u_id },
  ]);
  if (res) {
    return this.model("GroupSubmission")
      .find({ group: this.group })
      .populate("submissionEvent");
  } else {
    throw new APIError(403, "You can't view this group's submissions");
  }
});

groupsubmissionschema.method("createSubmission", async function (u_id) {
  // if returns true, then store file too
  // i want the file move thing to be in the controller and not here

  // check if user is part of the group that they're making
  // a submission for
  if (await Groups.findOne().or([{ group_members: u_id }, { leader: u_id }])) {
    const subev = await this.model("SubmissionEvent").findById(
      this.submissionEvent
    );
    if (subev && subev.available) {
      // ***********************
      // ***********************
      // ***********************
      //       IMPORTANT
      // also check DATETIME (cur time <= deadline)
      // sorry i'm lazy not doing it rn
      //       IMPORTANT
      // ***********************
      // ***********************
      // ***********************

      const gsbmodel = this.model("GroupSubmission");
      // check if this group doesn't already have a submission
      if (
        !(await gsbmodel.findOne({
          group: this.group,
          submissionEvent: subev._id,
        }))
      ) {
        return gsbmodel.create(this);
      } else {
        throw new APIError(400, "You can't submit again");
      }
    } else {
      throw new APIError(400, "Submission Rejected");
    }
  } else {
    throw new APIError(403, "You can't make a submission");
  }
});

groupsubmissionschema.method("markSubmission", async function (supervisor_id) {
  // check if the supervisor is only marking one of their groups
  const res = await Groups.findOne({
    _id: this.group,
    supervisor: supervisor_id,
  });

  if (res) {
    return this.model("GroupSubmission").updateOne(
      { submissionEvent: this.submissionEvent, group: this.group },
      { $set: { marks: this.marks } }
    );
  } else {
    throw new APIError(403, "You can't mark this submission");
  }
});

groupsubmissionschema.method(
  "changeSubmissionStatus",
  async function (supervisor_id) {
    // check if the supervisor is only marking one of their groups
    const res = await Groups.findOne({
      _id: this.group,
      supervisor: supervisor_id,
    });

    if (res) {
      return this.model("GroupSubmission").updateOne(
        { submissionEvent: this.submissionEvent, group: this.group },
        { $set: { status: this.status } }
      );
    } else {
      throw new APIError(403, "You can't change this submission status");
    }
  }
);

groupsubmissionschema.method("deleteSubmissionByGroupId", async function () {
  // find the all submissions of the group
  const res = await this.model("GroupSubmission").findOne({
    group: this.group,
  });

  // if their is submissions the delete those else return flag
  if (res) {
    return res.deleteMany();
  } else {
    return 1;
  }
});

module.exports = {
  SubmissionEvent: mongoose.model("SubmissionEvent", submissioneventschema),
  Submission: mongoose.model("GroupSubmission", groupsubmissionschema),
};
