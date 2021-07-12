const mongoose = require("mongoose");
const validator = require("validator");
const { APIError } = require("../helpers/error");
const { roles } = require("../helpers/constants");

const fypschema = mongoose.Schema(
  {
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      index: true,
    },
    area: {
      type: String,
      index: true,
      required: true,
    },
    prereq: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      index: true,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    creator_role: {
      type: String,
      default: roles.S,
      enum: Object.values(roles),
    },
  },
  {
    timestamps: true,
  }
);

//create a FYP idea
fypschema.method("createFypIdea", async function () {
  const Fyp = this.model("Fyp");
  const res = await Fyp.findOne({ created_by: this.created_by });
  if (res && res.creator_role == roles.S) {
    throw new APIError(400, "One student can give only one idea for FYP");
  }

  return Fyp.create(this);
});

fypschema.method("getAllIdeasByUserId", async function () {
  const Fyp = this.model("Fyp");
  return Fyp.find({ created_by: this.created_by, available: true });
});

fypschema.method("getStudentIdeas", async function () {
  const Fyp = this.model("Fyp");
  return Fyp.find({ creator_role: roles.S, available: true }).populate(
    "created_by",
    "-pswd"
  );
});

fypschema.method("getFacultyIdeas", async function () {
  const Fyp = this.model("Fyp");
  return Fyp.find({ creator_role: roles.F, available: true }).populate(
    "created_by",
    "-pswd"
  );
});

module.exports = mongoose.model("Fyp", fypschema);
