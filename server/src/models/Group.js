const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// const { response } = require("../app");

//
const groupSchema = Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    members: { type: String, required: true, ref: "User" }, // (users ID)
    posts: { type: String, ref: "Group" }, // (post by member)?
    comments: { type: String }, //?
    reactions: { type: String }, //?
    categories: { type: String, required: true, enum: ["home spa", "nature"] },
    interests: { type: String, required: true, enum: ["family", "english"] },
    //
    isDeleted: { type: Boolean, default: false, select: false },
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// hide password in admin
userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};

// authentication
userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
