const request = require("superagent");
const {
  baseURL,
  getAdminToken,
  getUserToken,
  createUserIfNotExists,
  postInChannel,
} = require("../utils");

async function messageEvent(messageText, channel, slackUser, req) {
  try {
    //Confirm the message is in a ticket-related channel
    const channelSplit = channel.name ? channel.name.split("_") : ["no", "no"];
    if (!(channelSplit[0] === "ddq" && channelSplit[1] === "ticket")) {
      return; //console.log("Message not in a ticket channel");
    }
    const ticket_id = channelSplit[2];

    //Handle the !close command
    if (messageText.includes("!close")) {
      const ticketResponse = await request
        .delete(`${baseURL(req)}/tickets/${ticket_id}`)
        .set("Authorization", `Bearer ${await getAdminToken()}`)
        .send({ channel_id: channel.id });
      return; //console.log("Close command sent");
    }

    //Handle the !unassign command
    if (messageText.includes("!unassign")) {
      const ticketResponse = await request
        .patch(`${baseURL(req)}/tickets/${ticket_id}/unassign`)
        .set("Authorization", `Bearer ${await getAdminToken()}`)
        .send({ channel_id: channel.id });
      return; //console.log("Close command sent");
    }

    //Add ticket-related messages to the database
    postInChannel(
      channel.id,
      "Your message was sent to the user. You'll see their reply in this channel."
    );
    const user = await createUserIfNotExists(slackUser, req);
    const addedMessage = await request
      .post(`${baseURL(req)}/tickets/${ticket_id}/messages`)
      .set("Authorization", `Bearer ${await getUserToken(user.user_id)}`)
      .send({ body: messageText, initiated_by_slackbot: true })
      .catch(console.log);
    //console.log("Added message\n", addedMessage.body);
  } catch (e) {
    console.log(e);
  }
}

module.exports = { messageEvent };
