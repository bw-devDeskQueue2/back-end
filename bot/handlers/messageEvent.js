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
    //Confirm the message is in a ticket-related channel
    const channelSplit = channel.name ? channel.name.split("_") : ["no", "no"];
    if (!(channelSplit[0] === "ddq" && channelSplit[1] === "ticket")) {
      return; //console.log("Message not in a ticket channel");
    }
    const ticket_id = channelSplit[2];

    //Ignore automated messages about channel actions
    //Messages start with a mention, hence the ">"
    if (
      messageText.includes("> has joined the") ||
      messageText.includes("> joined") ||
      messageText.includes("> was added to the") ||
      messageText.includes("> archived the") ||
      messageText.includes("> un-archived the")
    ) {
      return; //console.log("Person joining message");
    }

    //Handle the !close command
    if (messageText.includes("!close")) {
      const ticketResponse = await request
        .delete(`${baseURL(req)}/tickets/${ticket_id}`)
        .set("Authorization", `Bearer ${await getAdminToken()}`);
      const channelResponse = await closeChannel(channel.id);
      //console.log("ticket:", ticketResponse.status, ticketResponse.body, "channel: ", channelResponse);
      return; //console.log("Close command sent");
    }

    //Handle the !unassign command
    if (messageText.includes("!unassign")) {
      const ticketResponse = await request
        .patch(`${baseURL(req)}/tickets/${ticket_id}/unassign`)
        .set("Authorization", `Bearer ${await getAdminToken()}`);
      const channelResponse = await closeChannel(channel.id);
      //console.log("ticket:", ticketResponse.status, ticketResponse.body, "channel: ", channelResponse);
      return; //console.log("Close command sent");
    }

    //Add ticket-related messages to the database
    const user = await createUserIfNotExists(slackUser, req);
    const addedMessage = await request
      .post(`${baseURL(req)}/tickets/${ticket_id}/messages`)
      .set("Authorization", `Bearer ${await getUserToken(user.user_id)}`)
      .send({ body: messageText })
      .catch(console.log);
    //console.log("Added message\n", addedMessage.body);
  } catch (e) {
    console.log(e);
  }
}

module.exports = { messageEvent };
