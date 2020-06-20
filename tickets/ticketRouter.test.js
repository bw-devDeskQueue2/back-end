const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getBothToken,
  getAdminToken,
  getStudentToken,
} = require("../auth/authTestHelperFunctions");

describe("ticketRouter", () => {
  const bU = "/api/tickets";
  let studentToken;
  let bothToken;
  let adminToken;
  beforeAll(async done => {
    await knex.seed.run();
    studentToken = await getStudentToken();
    bothToken = await getBothToken();
    adminToken = await getAdminToken();
    done();
  });
  describe(`GET ${bU}`, () => {
    it("Returns a list of tickets to logged-in users", () =>
      request(server)
        .get(bU)
        .set("Authorization", "Bearer " + bothToken)
        .expect(200)
        .then(res => expect(res.body).toHaveLength(2)));
    it("Accepts a query string to filter by role", async () => {
      const studentRole = await request(server)
        .get(bU + "?role=student")
        .set("Authorization", "Bearer " + bothToken)
        .expect(200);
      expect(studentRole.body).toHaveLength(1);
      const bothRole = await request(server)
        .get(bU + "?role=both")
        .set("Authorization", "Bearer " + bothToken)
        .expect(200);
      expect(bothRole.body).toHaveLength(2);
      const helperRole = await request(server)
        .get(bU + "?role=helper")
        .set("Authorization", "Bearer " + bothToken)
        .expect(200);
      expect(helperRole.body).toHaveLength(1);
    });
    it("Accepts a query string to filter by status", async () => {
      const openTix = await request(server)
        .get(bU + "?status=open")
        .set("Authorization", "Bearer " + studentToken)
        .expect(200);
      expect(openTix.body).toHaveLength(3);
      const closedTix = await request(server)
        .get(bU + "?status=closed")
        .set("Authorization", "Bearer " + studentToken)
        .expect(200);
      expect(closedTix.body).toHaveLength(1);
      const allTix = await request(server)
        .get(bU + "?status=both")
        .set("Authorization", "Bearer " + studentToken)
        .expect(200);
      expect(allTix.body).toHaveLength(4);
    });
  });
  describe(`GET ${bU}/:id`, () => {
    it("Requires authentication", () =>
      request(server).get(`${bU}/1`).expect(401));
    it("Returns an error for invalid ticket IDs", () =>
      request(server)
        .get(`${bU}/999`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(404)
        .then(r => expect(r.body.message).toContain("999")));
    it("Returns an error for accessing someone else's tickets", () =>
      request(server)
        .get(`${bU}/3`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(403)
        .then(r => expect(r.body.message).toBeDefined()));
    it("Allows an admin to access any ticket", () =>
      request(server)
        .get(`${bU}/3`)
        .set("Authorization", "Bearer " + adminToken)
        .expect(200)
        .then(({ body }) => {
          expect(body.id).toBe(3);
          expect(body.student).toBeDefined();
          expect(body.messages).toBeDefined();
        }));
    it("Allows a user to access their own tickets", () =>
      request(server)
        .get(`${bU}/1`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(200)
        .then(({ body }) => {
          expect(body.id).toBe(1);
          expect(body.student).toBeDefined();
          expect(body.messages).toBeDefined();
        }));
  });
  describe(`POST ${bU}`, () => {
    it("Requires authentication", () => request(server).post(bU).expect(401));
    it("Returns an error for invalid ticket objects", () =>
      request(server)
        .post(bU)
        .set("Authorization", "Bearer " + studentToken)
        .expect(400));
    it("Returns a ticket that matches the original", async () => {
      const newTicket = {
        subject: "Can't use environment variables inside knex seeds",
        body: "Help it's not working",
        tags: ["technical", "web"],
      };
      const returnedTicket = await request(server)
        .post(bU)
        .set("Authorization", "Bearer " + studentToken)
        .send(newTicket)
        .expect(201)
        .then(r => r.body);
      expect(returnedTicket.subject).toBe(newTicket.subject);
      expect(returnedTicket.tags).toContain(newTicket.tags[0]);
      expect(returnedTicket.tags).toContain(newTicket.tags[1]);
      expect(returnedTicket.student).toEqual({
        id: 1,
        username: "test_student",
      });
      expect(returnedTicket.messages[0].body).toBe(newTicket.body);
    });
    it("Correctly adds new tags to the database", async () => {
      const newTicket = {
        subject: "Can't use environment variables inside knex seeds",
        body: "Help it's not working",
        tags: ["technical", "web", "heroku"],
      };
      const beforeTags = await request(server)
        .get(`/api/tags`)
        .then(r => r.body);
      const returnedTicket = await request(server)
        .post(bU)
        .set("Authorization", "Bearer " + studentToken)
        .send(newTicket)
        .expect(201)
        .then(r => r.body);
      const afterTags = await request(server)
        .get(`/api/tags`)
        .then(r => r.body);
      expect(afterTags).toHaveLength(beforeTags.length + 1);
      expect(returnedTicket.tags).toContain(newTicket.tags[0]);
      expect(returnedTicket.tags).toContain(newTicket.tags[1]);
      expect(returnedTicket.tags).toContain(newTicket.tags[2]);
    });
  });
  describe(`PATCH ${bU}/:id/update`, () => {
    it("Requires authentication", () =>
      request(server).patch(`${bU}/2/update`).expect(401));
    it("Returns an error for invalid ticket IDs", () =>
      request(server)
        .patch(`${bU}/not_an_id/update`)
        .send({ status: "closed" })
        .set("Authorization", "Bearer " + studentToken)
        .expect(404)
        .then(r => expect(r.body.message).toContain("not_an_id")));
    it("Returns an error for accessing someone else's tickets", () =>
      request(server)
        .patch(`${bU}/3/update`)
        .send({ status: "closed" })
        .set("Authorization", "Bearer " + studentToken)
        .expect(403)
        .then(r => expect(r.body.message).toBeDefined()));
  });
});
