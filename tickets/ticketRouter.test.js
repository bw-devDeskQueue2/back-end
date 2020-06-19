const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getStudentToken,
  getAdminToken,
  getNewUserToken,
} = require("../auth/authTestHelperFunctions");

describe("ticketRouter", () => {
  it("test", () => expect(true).toBe(true));
});
