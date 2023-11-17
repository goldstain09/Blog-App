const publicKey = process.env.PUBLIC_KEY;
const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split("Bearer ")[1];

    jwt.verify(token, publicKey, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.json({
            Unauthorized:true,
            errorMessage:"Token has Expired!"
          })
        } else {
          res.json({
            Unauthorized:true,
            errorMessage:"Failed to validate Token!"
          })
        }
      } else {
        req.userData = decoded;
        next();
      }
    });
  }
};

// verify
