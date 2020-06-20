const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getBothToken,
  getAdminToken,
  getHelperToken,
} = require("../auth/authTestHelperFunctions");

describe("messagesRouter", () => {
  const bU = "/api/tickets/4/messages";
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
  it("Returns an error for invalid ticket IDs", () =>
    request(server)
      .get(`/api/tickets/999/messages`)
      .set("Authorization", "Bearer " + bothToken)
      .expect(404)
      .then(r => expect(r.body.message).toContain("999")));
  it("Returns an error for accessing someone else's tickets", () =>
    request(server)
      .get(`${bU}`)
      .set("Authorization", "Bearer " + helperToken)
      .expect(403)
      .then(r => expect(r.body.message).toBeDefined()));
  describe(`GET ${bU}`, () => {
    it("Allows an admin to access any ticket's messages", () =>
      request(server)
        .get(`${bU}`)
        .set("Authorization", "Bearer " + adminToken)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(2);
          expect(body[0].id).toBe(7);
        }));
    it("Allows a user to access their own tickets' messages", () =>
      request(server)
        .get(`${bU}`)
        .set("Authorization", "Bearer " + bothToken)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(2);
          expect(body[0].id).toBe(7);
        }));
  });
  describe(`POST ${bU}`, () => {
    it("Returns an error for malformed message objects", () =>
      request(server)
        .post(`${bU}`)
        .set("Authorization", "Bearer " + bothToken)
        .send({ badProp: "value" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBeDefined();
        }));
    it("Allows users to send messages ", () =>
      request(server)
        .post(`${bU}`)
        .set("Authorization", "Bearer " + bothToken)
        .send({ body: "I'm sorry to hear that amigo" })
        .expect(201)
        .then(({ body: message }) => {
          expect(message.body).toBe("I'm sorry to hear that amigo");
          expect(message.sender_id).toBe(3);
          expect(message.ticket_id).toBe(4);
        }));
  });
});
