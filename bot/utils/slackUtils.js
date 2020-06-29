const request = require("superagent");
const config = require("../../config/serverInfo");
const { encode } = require("querystring");

//Slack requests for endpoints that support a JSON body
//Some endpoints that claim to support JSON don't so be wary
const slackRequest = (body, endpoint, token = config.OAUTH_ACCESS_TOKEN) =>
  request
    .post(`https://slack.com/api/${endpoint}`)
    .send(body)
    .set("Authorization", `Bearer ${token}`)
    .then(({ body }) => {
      if (!body.ok) {
        console.log(`Error with request to ${endpoint}: ${body.error}`);
      }
      return body;
    })
    .catch(console.error);

//Slack request for endpoints that don't support a JSON body
const slackUrlEncodedRequest = (body, endpoint) =>
  request
    .post(`https://slack.com/api/${endpoint}?${encode(body)}`)
    .then(({ body }) => {
      if (!body.ok) {
        console.log(`Error with request to ${endpoint}: ${body.error}`);
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

const getMembers = channel =>
  slackUrlEncodedRequest(
    { channel, token: config.BOT_ACCESS_TOKEN },
    "conversations.members"
  );

const closeChannel = channel =>
  slackUrlEncodedRequest(
    { channel, token: config.BOT_ACCESS_TOKEN },
    "conversations.archive"
  );

const sendDM = (users, message) =>
  //Open the DM, if not already open
  slackRequest({ users }, "conversations.open", config.BOT_ACCESS_TOKEN).then(
    body => {
      if (!body.channel) return;
      //Send the message
      return slackRequest(
        {
          username: config.BOT_USERNAME,
          channel: body.channel.id,
          token: config.BOT_ACCESS_TOKEN,
          text: message,
        },
        "chat.postMessage",
        config.BOT_ACCESS_TOKEN
      );
    }
  );

const openChannel = (users, message, name) =>
  slackUrlEncodedRequest(
    {
      name,
      token: config.BOT_ACCESS_TOKEN,
      // is_private: true,
    },
    "conversations.create"
  )
    .then(async ({ ok, channel }) => {
      let channelID;
      //If the channel didn't exist, we're gucci
      if (ok) {
        channelID = channel.id;
        return slackUrlEncodedRequest(
          {
            channel: channelID,
            users,
            token: config.BOT_ACCESS_TOKEN,
          },
          "conversations.invite"
        );
        //If the channel already exists:
      } else {
        //Get a list of all conversations
        const channelsList = await slackUrlEncodedRequest(
          { token: config.BOT_ACCESS_TOKEN },
          "conversations.list"
        );
        //Find the conversation with the name we want
        const targetChannel = channelsList.channels.find(
          channel => channel.name === name
        );
        if (!targetChannel) {
          return console.log("Error finding channel.");
        }
        //Unarchive the channel
        //This didn't work with the bot token
        //So it uses the OAuth token, and adds the workspace admin to the channel too
        await slackUrlEncodedRequest(
          { token: config.OAUTH_ACCESS_TOKEN, channel: targetChannel.id },
          "conversations.unarchive"
        );
        //Join the channel
        await slackUrlEncodedRequest(
          { token: config.BOT_ACCESS_TOKEN, channel: targetChannel.id },
          "conversations.join"
        );
        channelID = targetChannel.id;
        //Invite additional users to the channel
        await slackUrlEncodedRequest(
          {
            channel: channelID,
            users,
            token: config.BOT_ACCESS_TOKEN,
          },
          "conversations.invite"
        );
        //Regardless of whether invite threw an error or not, return enough info to post a message
        return { channel: { id: channelID } };
      }
    })
    .then(({ channel: { id: channelID } }) =>
      //Post the intro message in the channel
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
  getMembers,
};
