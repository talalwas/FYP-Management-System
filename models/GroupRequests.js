const mongoose = require("mongoose");

const { APIError } = require("../helpers/error");
const { decisions } = require("../helpers/constants");

const grouprequestschema = mongoose.Schema(
  {
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requested_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    request_status: {
      type: String,
      default: decisions.P,
      enum: Object.values(decisions),
    },
    request_type: {
      type: String,
      enum: ["member", "supervisor"],
      default: "member",
    },
    // i don't think we need this
    // fyp_id: { type: mongoose.Schema.Types.ObjectId, ref: "Fyp" },
  },
  {
    timestamps: true,
  }
);

//make a new request
grouprequestschema.method("makeRequest", async function () {
  const GroupReq = this.model("GroupRequest");
  if (
    await GroupReq.findOne({
      requested_to: this.requested_to,
      requested_by: this.requested_by,
    })
  ) {
    throw new APIError(
      400,
      "You already requested this user. Please wait for their response."
    );
  }
  return GroupReq.create(this);
});

//update request status
grouprequestschema.method("changeRequestStatus", async function (decision) {
  const GroupReq = this.model("GroupRequest");
  const request = await GroupReq.findById(this._id);
  if (!request) {
    throw new APIError(404, "Group Request Not Found");
  }
  await request.update({ request_status: decision });
  return request;
});

//get all requests TO user
grouprequestschema.method("getAllRequestsToUser", async function () {
  const GroupReq = this.model("GroupRequest");
  return GroupReq.find({ requested_to: this.requested_to }).populate(
    "requested_by",
    "-pswd"
  );
});

//get all requests By user
grouprequestschema.method("getAllRequestsByUser", async function () {
  const GroupReq = this.model("GroupRequest");
  return GroupReq.find({ requested_by: this.requested_by });
});

module.exports = mongoose.model("GroupRequest", grouprequestschema);
