const request = require("superagent");
const config = require("../../config/serverInfo");
module.exports = function getAdminToken(req, req, next) {
  console.log("request url", `${req.domain}/api/user/login`);
  return request
    .post(`${req.domain}/api/user/login`)
    .send({ username: "test_admin", password: config.ADMIN_PASS })
    .then(r => r.body.token)
    .catch(next);
};
