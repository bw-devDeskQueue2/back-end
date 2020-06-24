const request = require("superagent");
const config = require("../../config/serverInfo");
const knex = require("../../data/dbConfig");

const baseURL = req => `${req.protocol}://${req.get("host")}/api`;

function getAdminToken(req) {
  const url = `${baseURL(req)}/user/login`;
  return request
    .post(url)
    .send({ username: "test_admin", password: config.ADMIN_PASS })
    .then(r => r.body.token)
    .catch(console.error);
}

async function createUserIfNotExists(slack_id, team_id, next) {
  try {
    const existingUser = knex("slack_users")
      .where({ slack_id, team_id })
      .first();
    console.log("existing user for slack_id and team_id", existingUser);
  } catch (e) {
    next(e);
  }
}

module.exports = { baseURL, getAdminToken, createUserIfNotExists };
