const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken'); // token

//
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // .env

//
const userSchema = Schema(
  {
    name: { type: String, required: true }, // username OR company name for show account name
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },

    avatarUrl: { type: String, required: false, default: '' },
    aboutMe: { type: String, required: false, default: '' }, // short description
    city: { type: String, required: false, default: '' },
    country: { type: String, required: false, default: '' },
    company: { type: String, required: false, default: '' }, // company name
    others: { type: String, required: false, default: '' }, // san pham & dich vu
    // & document about product/service

    website: { type: String, required: false, default: '' },
    facebookLink: { type: String, required: false, default: '' },
    instagramLink: { type: String, required: false, default: '' },
    linkedinLink: { type: String, required: false, default: '' },
    twitterLink: { type: String, required: false, default: '' },
    youtubeLink: { type: String, required: false, default: '' },
    //
    isDeleted: { type: Boolean, default: false, select: false }, // soft delete
    friendCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    friendship: { type: Schema.ObjectId, ref: 'Friend' }, // relationship

    // Admin OR User
    roles: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user', //
    },
  },
  { timestamps: true }
);

// hide password in admin
userSchema.methods.toJSON = function () {
  const user = this._doc;
  // biome-ignore lint/performance/noDelete: <explanation>
  delete user.password;
  // biome-ignore lint/performance/noDelete: <explanation>
  delete user.isDeleted;
  return user;
};

// authentication
userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: '1d',
  });
  return accessToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
