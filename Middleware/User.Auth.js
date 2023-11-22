const publicKey = process.env.PUBLIC_KEY;
const jwt = require("jsonwebtoken");
const privateKey = process.env.PRIVATE_KEY;

exports.auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split("Bearer ")[1];

    jwt.verify(token, publicKey, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.json({
            Unauthorized: true,
            errorMessage: "Token has Expired!",
          });
        } else {
          res.json({
            Unauthorized: true,
            errorMessage: "Failed to validate Token!",
          });
        }
      } else {
        // here we re sign a token because if user using application continously then this auth middleware will run, but our token i valid only for 15 minutes
        // so I re sign a token and send it in response everytime and if user comes after 15 minutes or doing an activity then user login again in their account!
        
        // console.log(decoded.user);
        const newUserToken = jwt.sign(
          { user: decoded.user },
          privateKey,
          { algorithm: "RS256", expiresIn: `1h` }
        );
        req.userData = decoded;
        req.newUserToken = newUserToken;
        next();
      }
    });
  }
};

// verify
