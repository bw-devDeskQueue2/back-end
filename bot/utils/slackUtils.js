const request = require("superagent");
const config = require("../../config/serverInfo");

const slackRequest = (body, endpoint) =>
  request
    .post(`https://slack.com/api/${endpoint}`)
    .send(body)
    .set("Authorization", `Bearer ${config.OAUTH_ACCESS_TOKEN}`)
    .then(({ body }) => {
      if (!body.ok) {
        console.log("Error opening view", body);
      }
      return body;
    })
    .catch(console.error);

const openView = (trigger_id, view) =>
  slackRequest({ trigger_id, view }, "views.open");

const pushView = (trigger_id, view) =>
  slackRequest({ trigger_id, view }, "views.push");

const sendDM = (users, message) =>
  slackRequest({ users }, "conversations.open").then(body => {
    const {
      channel: { id: channelID },
    } = body;
    return slackRequest(
      {
        username: config.BOT_USERNAME,
        channel: channelID,
        token: config.BOT_ACCESS_TOKEN,
        text: message,
      },
      "chat.postMessage"
    );
  });
// request
//   .post("https://slack.com/api/conversations.open")
//   .send({ users })
//   .set("Authorization", `Bearer ${config.BOT_ACCESS_TOKEN}`)
//   .then(({ body }) => {
//     if (!body.ok) {
//       return console.log("opening error", body);
//     }
//     const {
//       channel: { id: channelID },
//     } = body;
//     return request
//       .post("https://slack.com/api/chat.postMessage")
//       .set("Authorization", `Bearer ${config.BOT_ACCESS_TOKEN}`)
//       .send({
//         username: config.BOT_USERNAME,
//         channel: channelID,
//         token: config.BOT_ACCESS_TOKEN,
//         text: message,
//       })
//       .then(({ body }) => {
//         if (!body.ok) {
//           console.log("sending error", body);
//         }
//         //console.log("sent", body);
//       });
//   })
//   .catch(console.error);

module.exports = { openView, pushView, sendDM };
