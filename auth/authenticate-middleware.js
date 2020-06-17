const db = require("../database/userModel");
const jwt = require("jsonwebtoken");
const config = require("../config/serverInfo");
const { catchAsync } = require("../config/errors");
async function checkUserAuthorization(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(403).json({
      message: "Please include your token in an Authorization header",
    });
  }
  const [authMode, auth] = authorization.split(" ");
  if (!authMode || !auth) {
    return res.status(401).json({
      message: "Malformed authorization header. Usage: 'Bearer your_jwt'",
    });
  }
  if (authMode.toLowerCase() !== "bearer") {
    return res.status(401).json({ message: "Please authorize with a token" });
  }
  jwt.verify(auth, config.JWT_SECRET, (err, data) => {
    if (err) return next(err);
    req.data = data;
    return next();
  });
}
module.exports = catchAsync(checkUserAuthorization);
