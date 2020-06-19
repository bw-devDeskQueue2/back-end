const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");

const { getStudentToken, getHelperToken } = require("../auth/authRouter.test");

describe("tags", () => {
  beforeAll(() => knex.seed.run());
  const bU = "/api/tags";
  describe(`GET ${bU}/`, () => {
    it("Returns a list of tags", () =>
      request(server)
        .get(bU)
        .expect(200)
        .then(res => expect(res.body).toHaveLength(7)));
  });
  describe(`GET ${bU}/:tagname`, () => {
    it("Forbids access to tickets by tag to students", async () => {
      const studentToken = await getStudentToken();
      request(server)
        .get(bU + "/account")
        .set("Authorization", "Bearer " + studentToken)
        .expect(403);
    });
    it("Returns a list of tickets to admins or helpers", async () => {
      const helperToken = await getHelperToken();
      return request(server)
        .get(bU + "/account")
        .set("Authorization", "Bearer " + helperToken)
        .expect(200)
        .then(res => expect(res.body.length).toBe(2));
    });
    it("Returns an error for an invalid tag name", async () => {
      const helperToken = await getHelperToken();
      return request(server)
        .get(bU + "/nonexistent_tag")
        .set("Authorization", "Bearer " + helperToken)
        .expect(404)
        .then(res => expect(res.body.message).toBeDefined());
    });
  });
});
