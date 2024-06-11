const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// const { response } = require("../app");
const User = require("../models/User");

//
const groupSchema = Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" }, // (users ID)
    name: { type: String, required: true }, //
    description: { type: String, required: true }, //
    members: [{ type: Schema.Types.ObjectId, ref: "User" }], // (users ID list)
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }], // (post by member)?
    interests: { type: String, required: true }, // cung la array
    //
    isDeleted: { type: Boolean, default: false, select: false },
    // memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// hide password in admin
// userSchema.methods.toJSON = function () {
//   const user = this._doc;
//   delete user.password;
//   delete user.isDeleted;
//   return user;
// };

// authentication
// userSchema.methods.generateToken = async function () {
//   const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
//     expiresIn: "1d",
//   });
//   return accessToken;
// };

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
