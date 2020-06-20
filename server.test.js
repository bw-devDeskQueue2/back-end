const request = require("supertest");
const server = require("./server");

describe("server", () => {
  const bU = "/api";
  it("Is in the correct testing environment", () => {
    expect(process.env.DB_ENV).toBe("test");
    expect(process.env.NODE_ENV).toBe("test");
  });
  it("Redirects the root URL to the documentation page", () =>
    request(server)
      .get(bU)
      .expect(302)
      .then(res => expect(res.header.location).toBeDefined()));
  it("Responds with an appropriate 404 object", () =>
    request(server)
      .get(`${bU}/bad_request_url`)
      .expect(404)
      .then(res => expect(res.body.message).toContain("bad_request_url")));
});
