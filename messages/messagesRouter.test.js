const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getBothToken,
  getAdminToken,
  getHelperToken,
} = require("../auth/authTestHelperFunctions");

describe("messagesRouter", () => {
  const bU = "/api/tickets/2/messages";
  let studentToken;
  let bothToken;
  let adminToken;
  let helperToken;
  beforeAll(async done => {
    await knex.seed.run();
    bothToken = await getBothToken();
    adminToken = await getAdminToken();
    helperToken = await getHelperToken();
    done();
  });
  it("Requires authentication", () => request(server).get(bU).expect(401));
});
