const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getBothToken,
  getAdminToken,
  getStudentToken,
  getHelperToken,
} = require("../auth/authTestHelperFunctions");

describe("ticketRouter", () => {
  const bU = "/api/tickets";
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
  it("Requires authentication", () => request(server).get(bU).expect(401));
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
    it("Correctly updates information", async () => {
      const updates = {
        subject: "New subject",
        status: "closed",
        rating: 10,
        tags: ["web", "account"],
      };
      const response = await request(server)
        .patch(`${bU}/1/update`)
        .send(updates)
        .set("Authorization", "Bearer " + studentToken)
        .expect(200)
        .then(r => r.body);
      expect(response.status).toBe(updates.status);
      expect(response.subject).toBe(updates.subject);
      expect(response.rating).toBe(updates.rating);
      expect(response.tags).toHaveLength(2);
      expect(response.tags).toContain(updates.tags[0]);
      expect(response.tags).toContain(updates.tags[1]);
    });
  });
  describe(`PATCH ${bU}/:id/assign`, () => {
    it("Returns an error for invalid ticket IDs", () =>
      request(server)
        .patch(`${bU}/not_an_id/assign`)
        .send({ status: "closed" })
        .set("Authorization", "Bearer " + studentToken)
        .expect(404)
        .then(r => expect(r.body.message).toContain("not_an_id")));
    it("Returns an error for accessing someone else's tickets", () =>
      request(server)
        .patch(`${bU}/3/assign`)
        .send({ status: "closed" })
        .set("Authorization", "Bearer " + studentToken)
        .expect(403)
        .then(r => expect(r.body.message).toBeDefined()));
    it("Assigns the ticket to the logged-in user if no user is supplied", () =>
      request(server)
        .patch(`${bU}/2/assign`)
        .set("Authorization", "Bearer " + bothToken)
        .expect(200)
        .then(r => expect(r.body.helper.username).toBe("test_both")));
    it("Returns an error if a non-helper tries to assign a ticket to themselves", () =>
      request(server)
        .patch(`${bU}/2/assign`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(400)
        .then(r => expect(r.body.message).toContain("id")));
    it("Allows any helper to assign an unassigned ticket", () =>
      request(server)
        .patch(`${bU}/2/assign`)
        .send({ username: "test_both" })
        .set("Authorization", "Bearer " + bothToken)
        .expect(200)
        .then(r => expect(r.body.helper.username).toBe("test_both")));
    it("Forbids non-admins from assigning tickets that aren't their own", () =>
      request(server)
        .patch(`${bU}/2/assign`)
        .send({ username: "test_both" })
        .set("Authorization", "Bearer " + helperToken)
        .expect(403)
        .then(r => expect(r.body.message).toBeDefined()));
    it("Allows admins to assign any ticket", () =>
      request(server)
        .patch(`${bU}/2/assign`)
        .send({ username: "test_both" })
        .set("Authorization", "Bearer " + adminToken)
        .expect(200)
        .then(r => expect(r.body.helper.username).toBe("test_both")));
    it("Allows users to assign their own tickets", () =>
      request(server)
        .patch(`${bU}/2/assign`)
        .send({ username: "test_helper" })
        .set("Authorization", "Bearer " + bothToken)
        .expect(200)
        .then(r => expect(r.body.helper.username).toBe("test_helper")));
  });
  describe(`PATCH ${bU}/:id/unassign`, () => {
    it("Returns an error for invalid ticket IDs", () =>
      request(server)
        .patch(`${bU}/not_an_id/unassign`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(404)
        .then(r => expect(r.body.message).toContain("not_an_id")));
    it("Forbids non-admins from unassigning tickets that aren't their own", () =>
      request(server)
        .patch(`${bU}/1/unassign`)
        .set("Authorization", "Bearer " + bothToken)
        .expect(403)
        .then(r => expect(r.body.message).toBeDefined()));
    it("Allows admins to unassign any ticket", () =>
      request(server)
        .patch(`${bU}/3/unassign`)
        .set("Authorization", "Bearer " + adminToken)
        .expect(200)
        .then(r => expect(r.body.helper.username).toBe(null)));
    it("Allows users to unassign their own tickets", () =>
      request(server)
        .patch(`${bU}/1/unassign`)
        .set("Authorization", "Bearer " + helperToken)
        .expect(200)
        .then(r => expect(r.body.helper.username).toBe(null)));
  });
  describe(`DELETE ${bU}/:id`, () => {
    it("Returns an error for invalid ticket IDs", () =>
      request(server)
        .delete(`${bU}/not_an_id`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(404)
        .then(r => expect(r.body.message).toContain("not_an_id")));
    it("Forbids non-admins from closing tickets that aren't their own", () =>
      request(server)
        .delete(`${bU}/2`)
        .set("Authorization", "Bearer " + bothToken)
        .expect(403)
        .then(r => expect(r.body.message).toBeDefined()));
    it("Allows users to close their own tickets", () =>
      request(server)
        .delete(`${bU}/2`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(200)
        .then(r => {
          expect(r.body.helper.username).toBe(null);
          expect(r.body.helper.id).toBe(null);
          expect(r.body.status).toBe("closed");
        }));
  });
  afterAll(async () => {
    // avoid jest open handle error
    await new Promise(resolve => setTimeout(() => resolve(), 100));
  });
});
