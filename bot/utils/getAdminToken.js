const request = require("superagent");
const config = require("../../config/serverInfo");
module.exports = function getAdminToken() {
  return request
    .post(`${req.domain}/api/user/login`)
    .send({ username: "test_admin", password: "wrong_password" })
    .then(r => r.body.token)
    .catch(console.error);
};
