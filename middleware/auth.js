/* eslint-disable */
const jwt = require('jsonwebtoken');
const { getDataBase } = require("../connect");
const { ObjectId } = require('mongodb')

module.exports = (secret) => (req, res, next) => {
  // console.log("ESTE ES EL REQUEST HEADERS", req.headers)
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }
// Aquí están creando un type y un token apartir del authorization que se envio desde el req.headers
// El type es Bearer
// El token sería el JWT que se genero al ingresar el usuario
  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, async (err, decodedToken) => {
    console.log("ESTE ES EL DECODEDTOKEN", decodedToken)
    if (err) {
      return next(403);
    }

    // TODO: Verify user identity using `decodeToken.uid`
    // Verificar  si el usuario tiene un JWT

    const { uid } = decodedToken
    const collection = getDataBase().collection('users')
    const userIdentity = await collection.findOne({ _id: new ObjectId(uid)})
    // TODO: si es useridentity es nulo 
    // if(!userIdentity){
    //   return res.status(403)
    // }
    // console.log(userIdentity)
    req.user = decodedToken
    return next()    
  });
};

module.exports.isAuthenticated = (req) => {
  if (!req.user) {
    return false
  } else {
    return true
  }
};

module.exports.isAdmin = (req) => {
  console.log("MIDDLEWARE REQ.USER", req.user.role)
  if(req.user.role === "admin"){
    return true
  }else{
    return false
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
