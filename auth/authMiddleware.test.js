const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const { getStudentToken } = require("./authTestHelperFunctions");

describe("authMiddleware", () => {
  const bU = "/api/auth_test";
  beforeAll(async done => {
    await knex.seed.run();
    studentToken = await getStudentToken();
    done();
  });
  it("Returns an error to users who don't send a token", () =>
    request(server)
      .get(bU)
      .expect(401)
      .then(r => {
        expect(r.body.message).toContain("token");
      }));
  it("Returns an error to users send an invalid token", () =>
    request(server)
      .get(bU)
      .set("Authorization", "Bearer invalid_jwt")
      .expect(400)
      .then(r => {
        expect(r.body.message).toContain("malformed");
      }));
  it("Allows users to proceed with a valid token", () =>
    request(server)
      .get(bU)
      .set("Authorization", "Bearer " + studentToken)
      .expect(200)
      .then(({ body }) => {
        expect(body.id).toBe(1);
        expect(body.username).toBe("test_student");
        expect(body.roles).toEqual(["student"]);
      }));
});
