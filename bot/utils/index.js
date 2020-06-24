const request = require("superagent");
const config = require("../../config/serverInfo");
const SlackUsers = require("../slackUserModel");

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
    const existingUser = await SlackUsers.getUser({ slack_id, team_id });
    console.log("existing user for slack_id and team_id", existingUser);
  } catch (e) {
    next(e);
  }
}

module.exports = { baseURL, getAdminToken, createUserIfNotExists };
