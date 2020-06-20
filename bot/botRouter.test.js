const request = require("supertest");
const server = require("../server");
const bU = "/bot";
const config = require("../config/serverInfo");
const crypto = require("crypto");

describe("botRouter", () => {
  let timestamp;
  beforeAll(() => (timestamp = Number(Date.now()) / 1000));
  function createSignature(body, requestTimestamp = timestamp) {
    const hmac = crypto.createHmac("sha256", config.SIGNING_SECRET);
    const version = "v0";
    const base = `${version}:${requestTimestamp}:${JSON.stringify(body)}`;
    hmac.update(base);
    return `${version}=${hmac.digest("hex")}`;
  }
  it("Returns an error with an invalid signature", () => {
    const body = { message: "testing" };
    return request(server)
      .post(`${bU}/testing`)
      .send(body)
      .set("X-Slack-Request-Timestamp", timestamp)
      .set("X-Slack-Signature", createSignature("not-the-body"))
      .expect(403)
      .then(r => expect(r.body.message).toContain("signature"));
  });
  it("Returns an error with an invalid timestamp", () => {
    const body = { message: "testing" };
    const badTimestamp = 10000;
    return request(server)
      .post(`${bU}/testing`)
      .send(body)
      .set("X-Slack-Request-Timestamp", badTimestamp)
      .set("X-Slack-Signature", createSignature(body, badTimestamp))
      .expect(403)
      .then(r => expect(r.body.message).toContain("timestamp"));
  });
  it("Allows requests with a valid signature and timestamp", () => {
    const body = { message: "testing" };
    return request(server)
      .post(`${bU}/testing`)
      .send(body)
      .set("X-Slack-Request-Timestamp", timestamp)
      .set("X-Slack-Signature", createSignature(body))
      .expect(204);
  });
  it("Responds to a challenge if one is provided", () => {
    const body = { challenge: "test_challenge" };
    return request(server)
      .post(`${bU}/testing`)
      .send(body)
      .set("X-Slack-Request-Timestamp", timestamp)
      .set("X-Slack-Signature", createSignature(body))
      .expect(200)
      .then(r => expect(r.body).toEqual(body));
  });
  describe(`POST ${bU}/events`, () => {
    it("Does nothing yet", () => {
      const body = { message: "testing" };
      return request(server)
        .post(`${bU}/events`)
        .send(body)
        .set("X-Slack-Request-Timestamp", timestamp)
        .set("X-Slack-Signature", createSignature(body))
        .expect(204);
    });
  });
});
