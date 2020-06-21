const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getStudentToken,
  getHelperToken,
} = require("../auth/authTestHelperFunctions");

describe("queueRouter", () => {
  const bU = "/api/tickets/queue";
  let studentToken;
  let helperToken;
  beforeAll(async done => {
    await knex.seed.run();
    studentToken = await getStudentToken();
    helperToken = await getHelperToken();
    done();
  });
  describe(`GET ${bU}/`, () => {
    it("Refuses access to students", () =>
      request(server)
        .get(bU)
        .set("Authorization", "Bearer " + studentToken)
        .expect(403));
    it("Displays the queue to helpers and admins", () =>
      request(server)
        .get(bU)
        .set("Authorization", "Bearer " + helperToken)
        .expect(200)
        .then(r => {
          expect(r.body).toHaveLength(1);
          const [first] = r.body;
          expect(first.queue_position).toBe(1);
          expect(first.id).toBe(2);
          expect(first.helper.id).toBe(null);
          expect(first.status).toBe("open");
        }));
  });
});
