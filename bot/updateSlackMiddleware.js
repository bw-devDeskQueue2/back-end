const {
  closeChannel,
  findChannelByName,
  openChannel,
  getMembers,
  sendDM,
} = require("./utils");
const SlackUsers = require("./slackUserModel");
const Users = require("../user/userModel");
const Tickets = require("../tickets/ticketsModel");
const OpenChannels = require("./slackChannelsModel");

async function closeSlackChannelIfNecessary(req, res, next) {
  const { channel_id } = req.body;
  const { ticketId } = req.params;
  try {
    const { helper, student } = await Tickets.getTicketById(ticketId);
    const slackHelper = await SlackUsers.getUser({ user_id: helper.id });
    const slackStudent = await SlackUsers.getUser({ user_id: student.id });
    const team_id = slackStudent
      ? slackStudent.team_id
      : slackHelper
      ? slackHelper.team_id
      : null;
    //console.log("Info on channel to close", team_id, ticketId);
    const channel = channel_id
      ? { channel_id }
      : await OpenChannels.findChannel({
          name: `ddq_ticket_${ticketId}`,
          team_id,
        });
    //console.log("Slack channel to close", channel);
    if (!channel) {
      return next();
    }
    const channelMembers = await getMembers(
      channel.channel_id
    ).then(({ ok, members }) => (ok ? members : []));
    await closeChannel(channel.channel_id);
    channelMembers.map(id =>
      sendDM(
        id,
        `Ticket #${ticketId} was ${
          req.originalUrl.includes("unassign")
            ? "unassigned and returned to the queue"
            : "closed"
        }.`
      ).catch(() => null)
    );
    next();
  } catch (e) {
    next(e);
  }
}

async function postSlackMessageIfNecessary(req, res, next) {
  //Making the key "body" in body was probably a mistake
  //But this isn't a typo
  const { initiated_by_slackbot, body } = req.body;
  const { id: sender_id } = req.data;
  const { id: ticket_id } = req.ticket;
  //Do nothing if slackbot sent the message
  if (initiated_by_slackbot) {
    return next();
  }
  //Get data from the existing ticket
  let { helper, student, messages, subject } = await Tickets.getTicketById(
    ticket_id
  );
  const slackHelper = await SlackUsers.getUser({ user_id: helper.id });
  const slackStudent = await SlackUsers.getUser({ user_id: student.id });
  //Establish message sender info
  const sender =
    sender_id == student.id
      ? student
      : sender_id == helper.id
      ? helper
      : await Users.getUser({ id: sender_id });
  const slackSender = await SlackUsers.getUser({ user_id: sender.id });
  //Do nothing if neither the helper nor the student is in slack
  if (!(slackHelper || slackStudent)) {
    return next();
  }
  const channelUsers =
    slackHelper && slackStudent
      ? `${slackHelper.slack_id},${slackStudent.slack_id}`
      : slackHelper
      ? slackHelper.slack_id
      : slackStudent.slack_id;
  const team_id = slackStudent
    ? slackStudent.team_id
    : slackHelper
    ? slackHelper.team_id
    : null;
  const channel = await OpenChannels.findChannel({
    name: `ddq_ticket_${ticket_id}`,
    team_id,
  });
  //If no channel is open but a slack user is on the ticket, open a channel
  if (!channel) {
    //Push the new message onto the messages object
    messages.push({ body, sender: await Users.getUser({ id: sender_id }) });
    //Add slack info to messages
    messages = await Promise.all(
      messages.map(async msg => ({
        ...msg,
        slackUser: await SlackUsers.getUser({ user_id: msg.sender.id }),
      }))
    );
    //Compose a welcome message
    const channelMessage = "-----------------------------------\n"
      .concat(`*This is the conversation for the ticket _${subject}_*\n`)
      .concat("-----------------------------------\n *Message History*\n")
      .concat(
        messages.map(
          msg =>
            `\n*${
              msg.slackUser
                ? `<@${msg.slackUser.slack_id}>`
                : msg.sender.username
            }:* ${msg.body}`
        )
      )
      .concat("\n-----------------------------------")
      .concat(
        "\nType in this channel to discuss the ticket.\nType `!close` to close the ticket."
      )
      .concat(
        "\nType `!unassign` to remove the assigned `helper` and place the ticket back in the queue."
      )
      .concat(
        !slackHelper
          ? `\n-----------------------------------\nAny messages you type here will be sent to *${helper.username}*, and you'll see their replies in this channel.`
          : ""
      );
    openChannel(
      channelUsers,
      channelMessage,
      `ddq_ticket_${ticket_id}`,
      team_id
    );
    return next();
  }

  //If a channel is open, post the message in it:
  const senderName = slackSender
    ? `<@${slackSender.slack_id}>`
    : sender.username;
  //Build message
  const slackPost = `*New Message from ${senderName}:*\n${body}\n`
    .concat(
      "--------------------\nType in this channel to send them a reply.\n"
    )
    .concat(
      "Type `!close` or `!unassign` at any time to close or unassign the ticket."
    );
  //Post message from sender
  openChannel(channelUsers, slackPost, `ddq_ticket_${ticket_id}`, team_id);
  //console.log(ticket_id, body, sender_id);
  next();
}

module.exports = { closeSlackChannelIfNecessary, postSlackMessageIfNecessary };
