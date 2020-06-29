const {
  closeChannel,
  findChannelByName,
  postInChannel,
  getMembers,
  sendDM,
} = require("./utils");
const SlackUsers = require("./slackUserModel");
const Users = require("../user/userModel");
const Tickets = require("../tickets/ticketsModel");

async function closeSlackChannelIfNecessary(req, res, next) {
  const { channel_id } = req.body;
  const { ticketId } = req.params;
  try {
    const channel = channel_id
      ? { id: channel_id }
      : await findChannelByName(`ddq_ticket_${ticketId}`);
    //console.log("Slack channel to close\n", channel);
    if (!channel || channel.is_archived) {
      return next();
    }
    const channelMembers = await getMembers(
      channel.id
    ).then(({ ok, members }) => (ok ? members : []));
    await closeChannel(channel.id);
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
  let { helper, student, messages } = await Tickets.getTicketById(ticket_id);
  const slackHelper = await SlackUsers.getUser({ user_id: helper.id });
  const slackStudent = await SlackUsers.getUser({ user_id: student.id });
  //Do nothing if neither the helper nor the student is in slack
  if (!(slackHelper || slackStudent)) {
    return next();
  }
  const channel = await findChannelByName(`ddq_ticket_${ticket_id}`);
  //TODO: Open a student-only channel if a non-slack helper responds
  if (!channel || channel.is_archived) {
    return next();
  }
  //Establish message sender info
  const sender =
    sender_id == student.id
      ? student
      : sender_id == helper.id
      ? helper
      : await Users.getUser({ id: sender_id });
  const slackSender = await SlackUsers.getUser({ user_id: sender.id });
  const senderName = slackSender
    ? `<@${slackSender.slack_id}>`
    : sender.username;
  const slackPost = `*New Message from ${senderName}:*\n${body}\n`
    .concat(
      "--------------------\nType in this channel to send them a reply.\n"
    )
    .concat(
      "Type `!close` or `!unassign` at any time to close or unassign the ticket."
    );
  //Post message from sender
  postInChannel(channel.id, slackPost);
  console.log(ticket_id, body, sender_id);
  next();
}

module.exports = { closeSlackChannelIfNecessary, postSlackMessageIfNecessary };
