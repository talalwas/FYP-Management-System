const Fyp = require("./../../models/Fyp");
const Groups = require("../../models/Groups");
const User = require("./../../models/Users");
const _ = require("underscore");
const exjwt = require("express-jwt");
const express = require("express");
const jwt = require("jsonwebtoken");
const process = require("process");
const roles = require("../../helpers/constants.js").roles;

const keys = {
  jwtsecret: process.env.jwtsecret,
};

const ejwtauth = exjwt({ secret: keys.jwtsecret, algorithms: ["HS256"] });

const router = express.Router();
const validateObjectID = require("mongoose").Types.ObjectId.isValid;
const { processValidationErrors, APIError } = require("../../helpers/error");
const { param, body } = require("express-validator");

/*
  --------
  Registration
  --------
*/

router.post(
  "/users/register",
  body("firstname").isAlpha().escape(),
  body("lastname").isAlpha().escape(),
  body("email", "Email is required and it must be a valid email.")
    .isEmail()
    .normalizeEmail(),
  body(
    "pswd",
    "Password is required, must contain atleast 6 characters, and must be a string."
  )
    .isLength({ min: 6 })
    .isString(),
  body("role").isString().isIn(Object.values(roles)),
  body("reg_no")
    .isString()
    // don't worry. its not supposed to be in quotes
    .matches(/^[A-Z]{2}\d\d-[A-Z]{3}-\d{3}$/)
    .optional(),
  processValidationErrors,
  (req, res, next) => {
    const props = ["firstname", "lastname", "email", "pswd", "role"];
    if (req.body.role == roles.S) {
      // if its a Student, include their reg_no, also
      props.push("reg_no");
    }
    let user = new User(_.pick(req.body, ...props));
    user
      .createUser()
      .then((_) => {
        res.send({ message: "User registered" });
      })
      .catch(next);
  }
);

/*
  --------
  Login
  --------
*/

router.post(
  "/users/login",
  body("email", "Email is required and must be a valid mail")
    .isEmail()
    .normalizeEmail(),
  body(
    "pswd",
    "Password is required, must contain atleast 6 characters, and must be a string."
  )
    .isString()
    .isLength({ min: 6 }),
  body("role").isIn(Object.values(roles)).isString(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .checkIfUserWithEmailExists(req.body.email)
      .then(async (_user) => {
        // verify role
        if (req.body.role == _user.role) {
          // verify password
          if (user.checkPass(_user, req.body.pswd)) {
            let tokenPayload = {
              _id: _user._id,
              firstname: _user.firstname,
              lastname: _user.lastname,
              email: _user.email,
              role: _user.role,
            };

            if (_user.role == roles.S) {
              // attach reg no to token
              tokenPayload.reg_no = _user.reg_no;

              const groups = new Groups();
              const group = await groups.getGroupWithUserId(_user._id);
              if (group) {
                if (group.leader._id.toString() == _user._id.toString()) {
                  tokenPayload.leader = group._id;
                } else {
                  tokenPayload.group = group._id;
                }
              }
            }

            let token = jwt.sign(tokenPayload, keys.jwtsecret);

            // TODO: never expiring tokens
            res.send({
              _id: _user._id,
              token,
              message: "Keep it safe :)",
            });
          } else {
            throw new APIError(400, "Invalid Password");
          }
        } else {
          throw new APIError(400, "Invalid Role");
        }
      })
      .catch(next);
  }
);

router.get(
  "/users/:id",
  param("id", "Invalid Object ID")
    .escape()
    .custom((value) => validateObjectID(value)),
  processValidationErrors,
  (req, res, next) => {
    let user = new User({ _id: req.params.id });
    user
      .getUser()
      .then(
        (data) =>
          (data && res.send(data)) || next(new APIError(400, "User not Found"))
      )
      .catch(next);
  }
);

router.get(
  "/users/checkRegNo/:reg_no",
  param("reg_no")
    .isString()
    .matches(/^[A-Z]{2}\d\d-[A-Z]{3}-\d{3}$/),
  processValidationErrors,
  (req, res, next) => {
    let user = new User({ reg_no: req.params.reg_no });
    user
      .checkIfUserWithRegnoExists()
      .then((data) => {
        (data && res.send(data)) || next(new APIError(400, "User not Found"));
      })
      .catch(next);
  }
);

router.get(
  "/users/check/:email",
  param("email").isString().isEmail(),
  processValidationErrors,
  (req, res, next) => {
    let user = new User();
    user
      .checkIfUserWithEmailExists(req.params.email)
      .then((data) => res.send(data))
      .catch(next);
  }
);

// delete a user
router.delete("/users/deleteAccount", ejwtauth, (req, res, next) => {
  const user = new User({ _id: req.user._id });
  user
    .deleteUser()
    .then((_) => {
      res.sendStatus(204);
    })
    .catch(next);
});

// get all committee users (id, mail, name)
router.get("/users/all/committee", ejwtauth, (req, res, next) => {
  let user = new User();
  user
    .getAllCommittee()
    .then((data) => res.send(data))
    .catch(next);
});

router.put(
  "/users/updatePassword/",
  ejwtauth,
  processValidationErrors,
  (req, res, next) => {
    const user = new User({ _id: req.user._id, pswd: req.body.pswd });
    user
      .updatePassword(req.body.oldpassword)
      .then((data) => {
        res.sendStatus(data ? 200 : 400);
      })
      .catch(next);
  }
);

module.exports = router;
