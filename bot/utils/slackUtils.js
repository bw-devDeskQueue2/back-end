const request = require("superagent");
const config = require("../../config/serverInfo");

const slackRequest = (body, endpoint, token = config.OAUTH_ACCESS_TOKEN) =>
  request
    .post(`https://slack.com/api/${endpoint}`)
    .send(body)
    .set("Authorization", `Bearer ${token}`)
    .then(({ body }) => {
      if (!body.ok) {
        console.log("Error with request to " + endpoint, body);
      }
      return body;
    })
    .catch(console.error);

const openView = (trigger_id, view) =>
  slackRequest({ trigger_id, view }, "views.open");

const pushView = (trigger_id, view) =>
  slackRequest({ trigger_id, view }, "views.push");

const sendDM = (users, message) =>
  slackRequest({ users }, "conversations.open", config.BOT_ACCESS_TOKEN).then(
    ({ channel: { id: channelID } }) =>
      slackRequest(
        {
          username: config.BOT_USERNAME,
          channel: channelID,
          token: config.BOT_ACCESS_TOKEN,
          text: message,
        },
        "chat.postMessage",
        config.BOT_ACCESS_TOKEN
      )
  );

const openChannel = (user_ids, message, name) =>
  slackRequest(
    { user_ids, name, is_private: true },
    "conversations.create",
    config.BOT_ACCESS_TOKEN
  ).then(({ channel: { id: channelID } }) =>
    slackRequest(
      {
        username: config.BOT_USERNAME,
        channel: channelID,
        token: config.BOT_ACCESS_TOKEN,
        text: message,
      },
      "chat.postMessage",
      config.BOT_ACCESS_TOKEN
    )
  );

module.exports = { openView, pushView, sendDM, openChannel };
