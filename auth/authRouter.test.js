const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");

const bU = "/api/user";
function logInAs(username, password) {
  return request(server)
    .post(bU + "/login")
    .send({ username, password });
}

const getStudentToken = () =>
  logInAs("test_student", "password").then(r => r.body.token);
const getHelperToken = () =>
  logInAs("test_helper", "password").then(r => r.body.token);
const getBothToken = () =>
  logInAs("test_both", "password").then(r => r.body.token);
const getAdminToken = () =>
  logInAs("test_admin", "dev_admin_pass").then(r => r.body.token);

describe("authRouter", () => {
  describe(`POST ${bU}/login`, () => {
    it("Returns a JWT upon successful login", async () => {
      const res = await logInAs("test_admin", "dev_admin_pass");
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });
  it("Returns an error when trying to log in as an undefined user", async () => {
    const res = await logInAs("nonexistent_user", "password");
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
    expect(res.body.token).toBeUndefined();
  });
  it("Returns an error when logging in with the wrong password", async () => {
    const res = await logInAs("test_student", "wrong_password");
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
    expect(res.body.token).toBeUndefined();
  });
});

module.exports = {
  getStudentToken,
  getHelperToken,
  getBothToken,
  getAdminToken,
};
