const mongoose = require("mongoose");
const { decisions } = require("../helpers/constants");

const { APIError } = require("../helpers/error");
const Fyp = require("./Fyp");
// const GroupSubmission = require("./Submission");

const groupschema = mongoose.Schema(
  {
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    group_members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    supervisor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    fyp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Fyp" },
    status: {
      type: String,
      default: decisions.P,
      enum: [decisions.A, decisions.P, decisions.R],
    },
  },
  {
    timestamps: true,
  }
);

groupschema.method("addGroup", async function () {
  let Group = this.model("Group");
  if (await Group.findOne({ leader: this.leader })) {
    throw new APIError(400, "You can't make another group.");
  }
  return Group.create(this);
});

groupschema.method("addGroupMember", async function (member_id) {
  let groups = this.model("Group");
  let group = await groups.findOne({ leader: this.leader });
  if (!group) {
    throw new APIError(404, "No group found");
  }

  if (group.group_members.length >= 3) {
    throw new APIError(412, "group members length exceeded");
  }

  group.group_members.push(member_id);
  await group.save();
  return group;
});

groupschema.method("addsupervisor", async function (leader_id, supervisor_id) {
  let groups = this.model("Group");
  let group = await groups.findOne({ leader: leader_id });
  if (!group) {
    throw new APIError(404, "No group found");
  }

  if (group.supervisor.length >= 3) {
    throw new APIError(412, "supervisors length exceeded");
  }

  group.supervisor.push(supervisor_id);
  await group.save();

  return group;
});

// delete supervisor if supervisor want to leave the group
groupschema.method(
  "deletesupervisor",
  async function (leader_id, supervisor_id, group_id) {
    let groups = this.model("Group");
    let group = await groups.findOne({
      leader: leader_id,
      _id: group_id,
      supervisor: supervisor_id,
    });
    if (!group) {
      throw new APIError(404, "No group found");
    }

    if (group.supervisor.length >= 3) {
      throw new APIError(412, "supervisors length exceeded");
    }

    group.supervisor.pull(supervisor_id);
    // make the project idea available to all students or supervisor again.
    let fyp = await Fyp.findOne({ _id: group.fyp_id });
    fyp.available = true;
    await fyp.save();

    // delete the fyp id from the group
    group.fyp_id = undefined;
    await group.save();

    return group;
  }
);

groupschema.method("addFyp", async function (leader_id, fyp_id) {
  let groups = this.model("Group");
  let group = await groups.findOne({ leader: leader_id });
  if (!group) {
    throw new APIError(404, "No group found");
  }
  group.fyp_id = fyp_id;
  await group.save();
  return group;
});

//updating group records by group id

groupschema.method("updategroupdetails", async function (_id, data) {
  let groups = this.model("Group");
  let group = await groups.findOne({ _id: _id });
  if (!group) {
    throw new APIError(404, "No group found");
  }

  await group.update(data);

  return group;
});

//delete a group
groupschema.method("deleteStudentGroup", async function (leader_id) {
  let groups = this.model("Group");
  let group = await groups.findOne({ leader: leader_id });
  if (!group) {
    throw new APIError(404, "No group found");
  }

  return await group.deleteOne();
});

groupschema.method("getGroupInfobyid", async function (_id) {
  let groups = this.model("Group");
  let group = await groups.findOne({ _id: _id });
  if (!group) {
    throw new APIError(404, "No group found");
  }

  return group;
});

// deleting a group
groupschema.method("getGroupInfo", async function (_id) {
  let groups = this.model("Group");
  let group = await groups.findOne({ _id: _id });
  if (!group) {
    throw new APIError(404, "No group found");
  }

  return await group.deleteOne();
});

// get group associated with a user id
groupschema.method("getGroupWithUserId", async function (id) {
  const group = this.model("Group");
  return group
    .findOne()
    .or([{ group_members: id }, { leader: id }])
    .populate({ path: "group_members", select: "-pswd" })
    .populate("supervisor", "-pswd")
    .populate("leader", "-pswd")
    .populate("fyp_id");
});

// get all groups supervised by the user
groupschema.method("getSupervisedGroups", async function (id) {
  const group = this.model("Group");
  return group
    .find({ supervisor: id })
    .populate({ path: "group_members", select: "-pswd" })
    .populate("supervisor", "-pswd")
    .populate("leader", "-pswd")
    .populate("fyp_id");
});

// check if user is a leader
groupschema.method("getGroupInfoByLeaderId", async function (id) {
  const group = this.model("Group");
  return group.findOne({ leader: id });
});

groupschema.method(
  "acceptGroupForSupervisionAndRegisterFYP",
  async function (s_id) {
    /* s_id is supervisor id */
    const Group = this.model("Group");
    const group = await Group.findById(this._id);
    if (group) {
      if (group.fyp_id) {
        throw new APIError(
          400,
          "Sorry, That group is already working on an FYP."
        );
      }

      // actions:
      // 1. attach fyp to fyp_id in the group
      // 2. add supervisor to supervisor list in the group
      // 3. mark fyp available as false
      const res = [];
      const r1 = await Group.updateOne(
        { _id: this._id },
        {
          $addToSet: { supervisor: s_id },
          $set: { fyp_id: this.fyp_id },
        }
      );

      const r2 = await Fyp.updateOne(
        { _id: this.fyp_id },
        { $set: { available: false } }
      );

      res.push(r1, r2);
      return res;
    } else {
      throw new APIError(404, "Group doesn't exist");
    }
  }
);

groupschema.method("allowSupervisionAndRegisterFYP", async function (s_id) {
  /* s_id is supervisor id */

  const group = await this.getGroupInfoByLeaderId(this.leader);
  if (group) {
    // there is already an fyp_id attr on the group
    if (group.fyp_id) {
      throw new APIError(400, "Tu mera putar chuti kar.");
    }

    if (group.group_members.length < 2) {
      throw new APIError(
        400,
        "You must have atleast 2 members in your group to perform this action."
      );
    }

    // actions:
    // 1. attach fyp to fyp_id in our group
    // 2. add supervisor to supervisor list in our group
    // 3. mark fyp available as false
    const res = [];
    const r1 = await this.model("Group").updateOne(
      { _id: group._id },
      {
        $addToSet: { supervisor: s_id },
        $set: { fyp_id: this.fyp_id },
      }
    );

    const r2 = await Fyp.updateOne(
      { _id: this.fyp_id },
      { $set: { available: false } }
    );

    res.push(r1, r2);
    return res;
  } else {
    throw new APIError(
      400,
      "Only Group Leaders can approve a supervisor request to supervise."
    );
  }
});

// get available fyps
groupschema.method("getInProgressFyp", async function () {
  const group = this.model("Group");

  return await group
    .find({ fyp_id: { $exists: true, $ne: null } })
    .populate({ path: "group_members", select: "-pswd" })
    .populate("supervisor", "-pswd")
    .populate("leader", "-pswd")
    .populate("fyp_id");
});

groupschema.method("changeFypStatus", async function (fyp_id, g_id) {
  const group = this.model("Group");

  return await group.updateOne(
    { fyp_id: fyp_id, _id: g_id },
    { $set: { status: this.status } }
  );
});
module.exports = mongoose.model("Group", groupschema);
