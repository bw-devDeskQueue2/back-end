function messageEvent(messageText, channel, slackUser) {
  const channelSplit = channel.name ? channel.name.split("_") : ["no", "no"];
  if (!(channelSplit[0] === "ddq" && channelSplit[1] === "ticket")) {
    return; //console.log("Message not in a ticket channel");
  }
  const ticket_id = channelSplit[2];
  if (messageText === "!close") {
    return console.log("Close command sent");
  }
  console.log(messageText);
}
module.exports = { messageEvent };
