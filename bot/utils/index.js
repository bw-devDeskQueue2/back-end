const request = require("superagent");
const config = require("../../config/serverInfo");
const SlackUsers = require("../slackUserModel");
const Users = require("../../user/userModel");
const { generateToken } = require("../../auth/authRouter");

const baseURL = req => `${req.protocol}://${req.get("host")}/api`;

function getAdminToken() {
  return Users.getUser({ username: "test_admin" }).then(generateToken);
}

function getUserToken(id) {
  return Users.getUser({ id }).then(generateToken);
}

async function createUserIfNotExists(slackUser, req) {
  try {
    const { slack_id, team_id, roles = ["student", "helper"] } = slackUser;
    const existingUser = await SlackUsers.getUser({ slack_id, team_id });
    //console.log("existing user for slack_id and team_id", existingUser);
    if (existingUser) {
      return existingUser;
    }
    let newUser = await request
      .post(`${baseURL(req)}/user/register`)
      .send({
        username: `${team_id}:${slack_id}`,
        password: config.GENERIC_PASSWORD,
        roles,
      })
      .then(r => r.body);
    //Successful creation returns an object with a user key
    //Errors return an object with a message key
    if (!newUser.user) {
      //console.error(newUser.message);
      return null;
    } else {
      return SlackUsers.addUser({
        user_id: newUser.user.id,
        slack_id,
        team_id,
      });
    }
  } catch (e) {
    console.error(e);
    //next(e);
  }
}

function sendDM(users, message) {
  return request
    .post("https://slack.com/api/conversations.open")
    .send({ users })
    .set("Authorization", `Bearer ${config.BOT_ACCESS_TOKEN}`)
    .then(({ body }) => {
      if (!body.ok) {
        return console.log("opening error", body);
      }
      const {
        channel: { id: channelID },
      } = body;
      return request
        .post("https://slack.com/api/chat.postMessage")
        .set("Authorization", `Bearer ${config.BOT_ACCESS_TOKEN}`)
        .send({
          username: config.BOT_USERNAME,
          channel: channelID,
          token: config.BOT_ACCESS_TOKEN,
          text: message,
        })
        .then(({ body }) => {
          if (!body.ok) {
            console.log("sending error", body);
          }
          //console.log("sent", body);
        });
    })
    .catch(console.error);
}

module.exports = {
  baseURL,
  getAdminToken,
  getUserToken,
  createUserIfNotExists,
  sendDM,
};
