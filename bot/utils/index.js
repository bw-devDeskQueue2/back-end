const request = require("superagent");
const config = require("../../config/serverInfo");
const SlackUsers = require("../slackUserModel");

const baseURL = req => `${req.protocol}://${req.get("host")}/api`;

function getAdminToken(req) {
  return request
    .post(`${baseURL(req)}/user/login`)
    .send({ username: "test_admin", password: config.ADMIN_PASS })
    .then(r => r.body.token)
    .catch(console.error);
}

async function createUserIfNotExists(slackUser, req, res, next) {
  try {
    const { slack_id, team_id, roles = ["student", "helper"] } = slackUser;
    const existingUser = await SlackUsers.getUser({ slack_id, team_id });
    //console.log("existing user for slack_id and team_id", existingUser);
    if (existingUser) {
      return existingUser;
    }
    let newUser = await request.post(`${baseURL(req)}/user/register`).send({
      username: `${team_id}:${slack_id}`,
      password: config.GENERIC_PASSWORD,
      roles,
    });
    //Successful creation returns an object with a user key
    //Errors return an object with a message key
    if (!newUser.user) {
      return next(newUser.message);
    }
    return SlackUsers.addUser({
      user_id: newUser.user.id,
      slack_id,
      team_id,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
}

module.exports = { baseURL, getAdminToken, createUserIfNotExists };
