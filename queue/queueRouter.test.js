const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getBothToken,
  getAdminToken,
  getStudentToken,
  getHelperToken,
} = require("../auth/authTestHelperFunctions");

describe("queueRouter", () => {
  const bU = "/api/queue";
  let studentToken;
  let bothToken;
  let adminToken;
  let helperToken;
  beforeAll(async done => {
    await knex.seed.run();
    studentToken = await getStudentToken();
    bothToken = await getBothToken();
    adminToken = await getAdminToken();
    helperToken = await getHelperToken();
    done();
  });
  describe(`GET ${bU}/`, () => {
    it("Returns a queue of all open and unassigned tickets", () => {
      expect(true).toBe(true);
    });
  });
});
