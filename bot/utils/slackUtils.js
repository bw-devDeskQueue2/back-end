const request = require("superagent");
const config = require("../../config/serverInfo");
const { encode } = require("querystring");

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

const slackUrlEncodedRequest = (body, endpoint) =>
  request
    .post(`https://slack.com/api/${endpoint}?${encode(body)}`)
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

const getChannelInfo = channel =>
  slackUrlEncodedRequest(
    { channel, token: config.BOT_ACCESS_TOKEN },
    "conversations.info"
  );

const closeChannel = channel =>
  slackUrlEncodedRequest(
    { channel, token: config.BOT_ACCESS_TOKEN },
    "conversations.archive"
  );

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

const openChannel = (users, message, name) =>
  slackUrlEncodedRequest(
    { name, token: config.BOT_ACCESS_TOKEN },
    "conversations.create"
  )
    .then(async ({ ok, channel }) => {
      let channelID;
      if (ok) {
        channelID = channel.id;
      } else {
        const channelsList = await slackUrlEncodedRequest(
          { token: config.BOT_ACCESS_TOKEN },
          "conversations.list"
        );
        //console.log(channelsList);
        const targetChannel = channelsList.channels.find(
          channel => channel.name === name
        );
        if (!targetChannel) {
          return console.log("Error finding channel.");
        }
        await slackUrlEncodedRequest(
          { token: config.BOT_ACCESS_TOKEN, channel: targetChannel.id },
          "conversations.unarchive"
        );
        await slackUrlEncodedRequest(
          { token: config.BOT_ACCESS_TOKEN, channel: targetChannel.id },
          "conversations.join"
        );
        channelID = targetChannel.id;
      }
      return slackUrlEncodedRequest(
        {
          channel: channelID,
          users,
          token: config.BOT_ACCESS_TOKEN,
        },
        "conversations.invite"
      );
    })
    .then(({ channel: { id: channelID } }) =>
      slackUrlEncodedRequest(
        {
          username: config.BOT_USERNAME,
          channel: channelID,
          token: config.BOT_ACCESS_TOKEN,
          text: message,
        },
        "chat.postMessage"
      )
    )
    .catch(console.log);

module.exports = {
  openView,
  pushView,
  sendDM,
  openChannel,
  closeChannel,
  getChannelInfo,
};
