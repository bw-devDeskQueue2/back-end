const request = require("superagent");
const {
  baseURL,
  closeChannel,
  getAdminToken,
  getUserToken,
  createUserIfNotExists,
  getMembers,
  sendDM,
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
        .send({ initiated_by_slackbot: true });
      const channelMembers = await getMembers(
        channel.id
      ).then(({ ok, members }) => (ok ? members : []));
      const channelResponse = await closeChannel(channel.id);
      channelMembers.map(id =>
        sendDM(id, `Ticket #${ticket_id} was successfully closed.`).catch(
          () => null
        )
      );
      //console.log("ticket:", ticketResponse.status, ticketResponse.body, "channel: ", channelResponse);
      return; //console.log("Close command sent");
    }

    //Handle the !unassign command
    if (messageText.includes("!unassign")) {
      const ticketResponse = await request
        .patch(`${baseURL(req)}/tickets/${ticket_id}/unassign`)
        .set("Authorization", `Bearer ${await getAdminToken()}`)
        .send({ initiated_by_slackbot: true });
      const channelMembers = await getMembers(
        channel.id
      ).then(({ ok, members }) => (ok ? members : []));
      const channelResponse = await closeChannel(channel.id);
      channelMembers.map(id =>
        sendDM(id, `Ticket #${ticket_id} was successfully unassigned.`).catch(
          () => null
        )
      );
      //console.log("ticket:", ticketResponse.status, ticketResponse.body, "channel: ", channelResponse);
      return; //console.log("Close command sent");
    }

    //Add ticket-related messages to the database
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
