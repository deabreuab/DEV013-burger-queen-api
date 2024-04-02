const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDataBase } = require('../connect');

module.exports = (secret) => (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }
  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      return next(403);
    }
    const { uid } = decodedToken;
    const collection = getDataBase().collection('users');
    const userIdentity = await collection.findOne({ _id: new ObjectId(uid)})
    req.user = decodedToken;
    return next();
  });
};

module.exports.isAuthenticated = (req) => {
  if (!req.user) {
    return false;
  } else {
    return true;
  }
};

module.exports.isAdmin = (req) => {
  if (req.user.role === 'admin') {
    return true;
  } else {
    return false;
  }
};

module.exports.requireAuth = (req, res, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, res, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
