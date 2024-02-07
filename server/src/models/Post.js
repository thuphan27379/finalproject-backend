const mongoose = require("mongoose");
// const { response } = require("../app");
const Schema = mongoose.Schema;

// Schema()
const postSchema = Schema(
  {
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    //
    isDeleted: { type: Boolean, default: false, select: false },
    commentCount: { type: Number, default: 0 },
    reactions: {
      like: { type: Number, default: 0 },
      dislike: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// model()
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
