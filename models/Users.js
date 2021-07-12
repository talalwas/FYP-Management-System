const mongoose = require("mongoose");
const roles = require("../helpers/constants.js").roles;
const bcrypt = require("bcrypt");
const validator = require("validator");
const { APIError } = require("../helpers/error");

const userschema = mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    reg_no: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: function (value) {
        return validator.isEmail(value);
      },
    },
    pswd: {
      type: String,
      required: true,
      set: function (value) {
        return bcrypt.hashSync(value, 10);
      },
    },
    role: {
      type: String,
      default: "Student",
      enum: [roles.F, roles.S, roles.C],
    },
  },
  {
    timestamps: true,
  }
);

userschema.method("createUser", async function () {
  let User = this.model("User");

  if ((await User.findOne({ email: this.email })) !== null) {
    throw new APIError(400, "User with this Email already exists");
  }
  if (this.reg_no && (await User.findOne({ reg_no: this.reg_no })) !== null) {
    throw new APIError(400, "User with this Registration No. already exists");
  }

  return User.create(this);
});

userschema.method("checkIfUserWithEmailExists", async function (email) {
  let User = this.model("User");
  let user = await User.findOne({ email });

  if (user == null) {
    throw new APIError(404, "No user with this email exists");
  }

  return user;
});

userschema.method("checkIfUserWithRegnoExists", async function () {
  let User = this.model("User");
  return await User.findOne({ reg_no: this.reg_no }).select("-pswd");
});

userschema.method("getUser", async function () {
  return this.model("User").findById(this._id).select("-pswd");
});

userschema.method("getUserByRegNo", async function (reg_no) {
  // TODO: rewrite
  let User = this.model("User");
  let user = await User.findOne({ reg_no: reg_no }).select("_id");
  console.log(user);
  if (!user) {
    throw new APIError(404, "No user found");
  }
  return user;
});

userschema.method("getAllCommittee", async function () {
  return this.model("User").find({ role: roles.C }).select("-pswd");
});

userschema.method("checkPass", function (user, pswd) {
  return bcrypt.compareSync(pswd, user.pswd);
});

userschema.method("deleteUser", async function () {
  return await this.model("User").deleteOne({ _id: this._id });
});

userschema.method("updatePassword", async function (input_pswd) {
  const user = await this.model("User").findOne({ _id: this._id });
  if (user == null) {
    throw new APIError(404, "No User Found");
  }

  if (bcrypt.compareSync(input_pswd, user.pswd)) {
    return user.updateOne({ pswd: this.pswd });
  }
  throw new APIError(404, "old password does not match");
});

module.exports = mongoose.model("User", userschema);
