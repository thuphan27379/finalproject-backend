const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// project
// startup
// domain
const domainSchema = Schema({
  name: { type: String, required: true }, // domain
  topLevel: { type: String, required: true }, // .com .net .org ...
  subName: { type: String }, // www.subName.domain.com
  subDir: { type: String }, //  www.domain.com/subDir
  path: { type: String }, // www.domain.com/subDir/path

  description: { type: String, required: true }, // domain meaning
  ideas: { type: String }, // ideas detail for project OR startup...
  price: { type: Number, required: true },
  renew: { type: String, required: true }, // Registry Expiration // for admin only
  others: { type: String }, // types
  links: { type: String }, // hosting

  isProject: { type: Boolean, default: true },
  isStartup: { type: Boolean, default: true },
  isSale: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }, // soft delete
});

const Domain = mongoose.model('Domain', domainSchema);
module.exports = Domain;
