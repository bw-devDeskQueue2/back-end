const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");

const {
  getStudentToken,
  getHelperToken,
} = require("../auth/authTestHelperFunctions");

describe("tags", () => {
  let helperToken;
  let studentToken;
  beforeAll(async done => {
    await knex.seed.run();
    helperToken = await getHelperToken();
    studentToken = await getStudentToken();
    done();
  });
  const bU = "/api/tags";
  describe(`GET ${bU}/`, () => {
    it("Returns a list of tags", () =>
      request(server)
        .get(bU)
        .expect(200)
        .then(res => expect(res.body).toHaveLength(7)));
  });
  describe(`GET ${bU}/:tagname`, () => {
    it("Forbids access to tickets by tag to students", () =>
      request(server)
        .get(bU + "/account")
        .set("Authorization", "Bearer " + studentToken)
        .expect(403));
    it("Returns an error for an invalid tag name", () =>
      request(server)
        .get(bU + "/nonexistent_tag")
        .set("Authorization", "Bearer " + helperToken)
        .expect(404)
        .then(res => expect(res.body.message).toBeDefined()));
    it("Returns a list of tickets to admins or helpers", () =>
      request(server)
        .get(bU + "/account")
        .set("Authorization", "Bearer " + helperToken)
        .expect(200)
        .then(res => expect(res.body.length).toBe(2)));
    it("Successfully filters by ticket status", () =>
      request(server)
        .get(bU + "/web?status=open")
        .set("Authorization", "Bearer " + helperToken)
        .expect(200)
        .then(res => expect(res.body.length).toBe(3)));
    it("Successfully filters by assignment status", () =>
      request(server)
        .get(bU + "/technical?assigned=true")
        .set("Authorization", "Bearer " + helperToken)
        .expect(200)
        .then(res => expect(res.body.length).toBe(2)));
  });
  afterAll(async () => {
    // avoid jest open handle error
    await new Promise(resolve => setTimeout(() => resolve(), 100));
  });
});
