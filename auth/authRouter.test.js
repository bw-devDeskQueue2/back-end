const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");

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

describe("authRouter", () => {
  beforeAll(() => knex.seed.run());
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
  describe(`POST ${bU}/register`, () => {
    it("Returns an error for a malformed object", () =>
      request(server)
        .post(bU + "/register")
        .send({ not_username: "hi", not_password: "password", not_roles: [] })
        .expect(400));
    it("Returns an error when trying to register a duplicate user", () =>
      request(server)
        .post(bU + "/register")
        .send({ username: "test_student", password: "password", roles: [] })
        .expect(400)
        .then(r => expect(r.body.message).toContain("test_student")));
    it("Returns an error when trying to register as admin", () =>
      request(server)
        .post(bU + "/register")
        .send({ username: "new_admin", password: "password", roles: ["admin"] })
        .expect(403)
        .then(r => expect(r.body.message).toContain("Admin")));
    it("Returns an error when trying to register with an invalid role", () =>
      request(server)
        .post(bU + "/register")
        .send({ username: "new_user", password: "none", roles: ["no_role"] })
        .expect(400)
        .then(r => expect(r.body.message).toContain("no_role")));
    it("Returns an error when roles isn't an array", () =>
      request(server)
        .post(bU + "/register")
        .send({ username: "new_user", password: "none", roles: "no_role" })
        .expect(400)
        .then(r => expect(r.body.message).toContain("array")));
    it("Returns a user object with token upon successful registration", () =>
      registerNewUser()
        .expect(201)
        .then(({ body }) => {
          expect(body.user).toBeDefined();
          expect(body.user.id).toBe(5);
          expect(body.token).toBeDefined();
        }));
  });
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
  getStudentToken,
  getHelperToken,
  getBothToken,
  getAdminToken,
  getNewUserToken,
};
