const request = require("superagent");
const config = require("../../config/serverInfo");

function getAdminToken(req, req, next) {
  const url = `${req.protocol}://${req.get("host")}/api/user/login`;
  console.log(url);
  return request
    .post(url)
    .send({ username: "test_admin", password: config.ADMIN_PASS })
    .then(r => r.body.token)
    .catch(next);
}

module.exports = { getAdminToken };
