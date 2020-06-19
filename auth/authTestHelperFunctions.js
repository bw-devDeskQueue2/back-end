const request = require("supertest");
const server = require("../server");
const bU = "/api/user";

const logInAs = (username, password) =>
  request(server)
    .post(bU + "/login")
    .send({ username, password });

const registerNewUser = () =>
  request(server)
    .post(bU + "/register")
    .send({
      username: "new_user",
      password: "password",
      roles: ["student"],
    });

const getNewUserToken = () => registerNewUser().then(r => r.body.token);
const getStudentToken = () =>
  logInAs("test_student", "password").then(r => r.body.token);
const getHelperToken = () =>
  logInAs("test_helper", "password").then(r => r.body.token);
const getBothToken = () =>
  logInAs("test_both", "password").then(r => r.body.token);
const getAdminToken = () =>
  logInAs("test_admin", "dev_admin_pass").then(r => r.body.token);

module.exports = {
  logInAs,
  registerNewUser,
  getStudentToken,
  getHelperToken,
  getBothToken,
  getAdminToken,
  getNewUserToken,
};
