const request = require("superagent");
const {
  baseURL,
  closeChannel,
  getAdminToken,
  getUserToken,
  createUserIfNotExists,
} = require("../utils");
const SlackUsers = require("../slackUserModel");

async function messageEvent(messageText, channel, slackUser, req) {
  try {
    const channelSplit = channel.name ? channel.name.split("_") : ["no", "no"];
    if (!(channelSplit[0] === "ddq" && channelSplit[1] === "ticket")) {
      return; //console.log("Message not in a ticket channel");
    }
    const ticket_id = channelSplit[2];
    if (messageText.includes("has joined the channel")) {
      return; //console.log("Person joining message");
    }
    if (messageText.includes("!close")) {
      const ticketResponse = await request
        .delete(`${baseURL(req)}/tickets/${ticket_id}`)
        .set("Authorization", `Bearer ${await getAdminToken()}`);
      const channelResponse = await closeChannel(channel.id);
      //console.log("ticket:", ticketResponse.status, ticketResponse.body, "channel: ", channelResponse);
      return; //console.log("Close command sent");
    }
    let user = await SlackUsers.getUser(slackUser);
    if (!user) {
      user = await createUserIfNotExists(slackUser);
    }
    console.log(user.user_id);
    console.log(messageText);
  } catch (e) {
    console.log(e);
  }
}

module.exports = { messageEvent };
