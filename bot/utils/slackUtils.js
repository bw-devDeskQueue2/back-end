const request = require("superagent");
const config = require("../../config/serverInfo");

const openView = (trigger_id, view) =>
  request
    .post("https://slack.com/api/views.open")
    .send({ trigger_id, view })
    .set("Authorization", `Bearer ${config.OAUTH_ACCESS_TOKEN}`)
    .then(({ body }) => {
      if (!body.ok) {
        console.log("Error opening view", body);
      }
      //activeViews.push(body);
    });
    
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
module.exports = { openView, sendDM };
