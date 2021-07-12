const mongoose = require("mongoose");
const { APIError } = require("../helpers/error");
const { roles } = require("../helpers/constants");
const Fyp = require("./Fyp");
const { populate } = require("./Fyp");

const applicationqueueschema = mongoose.Schema(
  {
    fyp: { type: mongoose.Schema.Types.ObjectId, ref: "Fyp" },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamp: true }
);

applicationqueueschema.method("getSupervisors", async function (user) {
  // check if the user created the FYP that they are trying
  // to get the supervisors for
  const fyp = await Fyp.findOne({ created_by: user, _id: this.fyp });
  if (fyp) {
    const res = await this.model("ApplicationQueue")
      .findOne({ fyp: this.fyp })
      .populate("fyp")
      .populate({
        path: "supervisors",
        select: "-pswd",
      })
      .sort("fyp");
    return res;
  } else {
    throw new APIError(403, "Bad Request");
  }
});

applicationqueueschema.method("getGroups", async function (user, fyps) {
  const fyp = await Fyp.find({ created_by: user, _id: { $in: fyps } });
  if (fyp.length > 0) {
    const res = await this.model("ApplicationQueue")
      .find({
        fyp: { $in: fyps },
      })
      .populate("fyp")
      .populate({
        path: "groups",
        populate: { path: "leader", select: "-pswd" },
      })
      .sort("fyp");
    return res || [];
  } else {
    throw new APIError(403, "Bad Request");
  }
});

applicationqueueschema.method("addCandidateGroup", async function (group_id) {
  const fyp = await Fyp.findOne({ _id: this.fyp });
  // check availability
  if (fyp.available) {
    // add group id to the array (set)
    if (fyp.creator_role == roles.F) {
      const appQueue = this.model("ApplicationQueue");
      const find = await appQueue.findOne({ fyp: this.fyp });
      if (find) {
        return appQueue.update(
          { fyp: this.fyp },
          { $addToSet: { groups: group_id } }
        );
      } else {
        return appQueue.create({ fyp: this.fyp, groups: [group_id] });
      }
    } else {
      throw new APIError(400, "You can only apply to Supervisor's Ideas");
    }
  } else {
    throw new APIError(400, "FYP is not available.");
  }
});

applicationqueueschema.method(
  "addCandidateSupervisor",
  async function (fac_id) {
    // fac_id is the faculty id
    const fyp = await Fyp.findOne({ _id: this.fyp });
    if (fyp.available) {
      if (fyp.creator_role == roles.S) {
        // add supervisor to supervisor array (set)
        const appQueue = this.model("ApplicationQueue");
        // find existing applications for this FYP
        const find = await appQueue.findOne({ fyp: this.fyp });
        if (find) {
          return appQueue.update(
            { fyp: this.fyp },
            { $addToSet: { supervisors: fac_id } }
          );
        } else {
          return appQueue.create({ fyp: this.fyp, supervisors: [fac_id] });
        }
      } else {
        throw new APIError(400, "You can only apply to Students ideas.");
      }
    } else {
      throw new APIError(400, "FYP is not available.");
    }
  }
);

module.exports = mongoose.model("ApplicationQueue", applicationqueueschema);
