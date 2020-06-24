const request = require("superagent");
const config = require("../../config/serverInfo");

const baseURL = req => `${req.protocol}://${req.get("host")}/api`;

function getAdminToken(req) {
  const url = `${baseURL(req)}/user/login`;
  return request
    .post(url)
    .send({ username: "test_admin", password: config.ADMIN_PASS })
    .then(r => r.body.token)
    .catch(console.error);
}

module.exports = { baseURL, getAdminToken };
