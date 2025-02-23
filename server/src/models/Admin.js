const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken'); // token

//
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // .env

//
const adminSchema = Schema(
  {
    name: { type: String, required: true }, // username OR company name for show account name
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },

    avatarUrl: { type: String, required: false, default: '' },
    aboutMe: { type: String, required: false, default: '' }, // short description
    city: { type: String, required: false, default: '' },
    country: { type: String, required: false, default: '' },
    company: { type: String, required: false, default: '' }, // company name
    others: { type: String, required: false, default: '' }, //
    links: { type: String, required: false, default: '' },
    contact: { type: String, required: false, default: '' }, // email, phone
    roles: {
      // ?
      type: String,
      enum: ['admin', 'user'], // admin only
      required: true,
      default: 'admin', //
      ref: 'User', // user model
    },
  },
  { timestamps: true }
);

// // hide password in admin
// adminSchema.methods.toJSON = function () {
//   const admin = this._doc;
//   // biome-ignore lint/performance/noDelete: <explanation>
//   delete admin.password;
//   // biome-ignore lint/performance/noDelete: <explanation>
//   delete admin.isDeleted;
//   return admin;
// };

// authentication
adminSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: '1d',
  });
  return accessToken;
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
