const Joi = require("@hapi/joi");
const httpsStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const User = require("../models/userModels");
const Helpers = require("../Helpers/helpers");
const jwt = require("jsonwebtoken");
const dbconfig = require("../config/secret");
module.exports = {
  async CreateUser(req, res) {
    const schema = Joi.object({
      username: Joi.string()
        .min(5)
        .max(10)
        .required(),
      password: Joi.string()
        .min(5)
        .required(),
      email: Joi.string()
        .email()
        .required()
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      console.log(value);
      return res
        .status(httpsStatus.BAD_REQUEST)
        .json({ message: error.details });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(req.body.email)
    });
    if (userEmail) {
      return res
        .status(httpsStatus.CONFLICT)
        .json({ message: "Email Already Exists." });
    }
    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username)
    });
    if (userName) {
      return res
        .status(httpsStatus.CONFLICT)
        .json({ message: "Username Already Exist." });
    }
    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(httpsStatus.BAD_REQUEST)
          .json({ message: "Error Occured Due to hashing password" });
      }
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowerCase(value.email),
        password: hash
      };
      User.create(body)
        .then(user => {
          const token = jwt.sign({ data: user }, dbconfig.secret, {
            expiresIn: 120
          });
          res.cookie("auth", token);
          res
            .status(httpsStatus.CREATED)
            .json({ message: "User Created SuccessFully", user, token });
        })
        .catch(err => {
          res
            .status(httpsStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Error Occured" });
        });
    });
  }
};
