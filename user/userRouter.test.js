const request = require("supertest");
const server = require("../server");
const knex = require("../data/dbConfig");
const {
  getStudentToken,
  getAdminToken,
  getNewUserToken,
} = require("../auth/authTestHelperFunctions");

describe("userRouter", () => {
  const maxExistingUserID = 4;
  const bU = "/api/user";
  beforeAll(() => knex.seed.run());
  describe(`GET ${bU}/`, () => {
    it("Returns a user object to logged-in users", async () => {
      const studentToken = await getStudentToken();
      return request(server)
        .get(bU)
        .set("Authorization", "Bearer " + studentToken)
        .expect(200)
        .then(({ body }) => {
          expect(body.id).toBe(1);
          expect(body.username).toBe("test_student");
          expect(body.roles).toEqual(["student"]);
        });
    });
  });
  describe(`DELETE ${bU}/:id`, () => {
    it("Returns an error if not authorized", async () => {
      const studentToken = await getStudentToken();
      return request(server)
        .delete(`${bU}/${maxExistingUserID}`)
        .set("Authorization", "Bearer " + studentToken)
        .expect(403)
        .then(r => expect(r.body.message).toContain("admin"));
    });
    it("Returns an error when trying to delete a nonexistent user", async () => {
      const adminToken = await getAdminToken();
      return request(server)
        .delete(`${bU}/${maxExistingUserID + 5}`)
        .set("Authorization", "Bearer " + adminToken)
        .expect(404)
        .then(r => expect(r.body.message).toContain(maxExistingUserID + 5));
    });
    it("Allows a user to delete themselves", async () => {
      const newUserToken = await getNewUserToken();
      return request(server)
        .delete(`${bU}/${maxExistingUserID + 1}`)
        .set("Authorization", "Bearer " + newUserToken)
        .expect(204);
    });
    it("Allow an admin to delete any user", async () => {
      const adminToken = await getAdminToken();
      await getNewUserToken();
      return request(server)
        .delete(`${bU}/${maxExistingUserID + 2}`)
        .set("Authorization", "Bearer " + adminToken)
        .expect(204);
    });
  });
});
