const config = require("../config/serverInfo");
module.exports = function restrictAccess(req, res, next) {
  if (req.session && req.session.user) next();
  else {
    if (req.session) req.session.destroy();
    res.clearCookie(config.COOKIE_NAME);
    res
      .status(401)
      .json({ message: "Error: you must be logged in to do that." });
  }
};
