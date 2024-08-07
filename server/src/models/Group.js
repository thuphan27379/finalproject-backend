const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const User = require("../models/User");

//
const groupSchema = Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" }, // (users ID)
    name: { type: String, required: true }, //
    description: { type: String, required: true }, //
    interests: [{ type: String, required: true }], //

    members: [{ type: Schema.Types.ObjectId, ref: "User" }], // (users ID list)
    // list posts by group
    postsByGroupId: [{ type: Schema.Types.ObjectId, ref: "Post" }], // (postId by groupId)
    postGroupCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
