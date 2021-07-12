const mongoose = require("mongoose");
const { APIError } = require("../helpers/error");
const Group = require("./Groups");

const messageschema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    // set if it's sent to a group
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    // set if sent to an individual
    reciever: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

messageschema.method("saveMessage", async function () {
  // stores a single message
  // 1. sender to reciever
  // 2. group message

  if (this.sender && this.reciever) {
    // we want to store a single message from sender to reciever
    return this.model("Message").create(this);
  } else if (this.sender && this.group) {
    // we want to store a single message sent to a group by a sender
    // check if sender is part of the group
    // TODO: we should only have 1 method that checks this instead of duplicating code
    const group = await Group.findOne().or([
      { group_members: this.sender },
      { supervisor: this.sender },
      { leader: this.sender },
    ]);
    if (group) {
      return this.model("Message").create(this);
    } else {
      throw new APIError(403, "You can't send a message to this group");
    }
  }
});

messageschema.method("getMessages", async function () {
  // returns messages from
  // 1. sender to reciever
  // 2. group messages
  // sorted by time created

  const message = this.model("Message");
  if (this.sender && this.reciever) {
    // we want the sender to reciever messages
    return message
      .find({ sender: this.sender, reciever: this.reciever })
      .populate("sender", "-pswd")
      .populate("reciever", "-pswd")
      .sort("createdAt");
  } else if (this.sender && this.group) {
    // we want to get all group messages
    const group = await Group.findOne().or([
      { group_members: this.sender },
      { supervisor: this.sender },
      { leader: this.sender },
    ]);
    if (group) {
      // get all group messages
      return message
        .find({ group: this.group })
        .populate("sender", "-pswd")
        .sort("createdAt");
    } else {
      throw new APIError(403, "You can't view this group's messages");
    }
  }
});

module.exports = mongoose.model("Message", messageschema);
