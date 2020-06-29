const { closeChannel, findChannelByName, getMembers } = require("./utils");
const SlackUsers = require("./slackUserModel");

async function closeSlackChannelIfNecessary(req, res, next) {
  const { initiated_by_slackbot } = req.body;
  const { ticketId } = req.params;
  if (initiated_by_slackbot) {
    return next();
  }
  try {
    const channel = await findChannelByName(`ddq_ticket_${ticketId}`);
    console.log("Slack channel to close\n", channel);
    // if (!channel) return next();
    // const channelMembers = await getMembers(
    //   channel.id
    // ).then(({ ok, members }) => (ok ? members : []));
    // const channelResponse = await closeChannel(channel.id);
    // channelMembers.map(id =>
    //   sendDM(
    //     id,
    //     `Ticket #${ticketId} was successfully ${
    //       req.originalUrl.includes("close") ? "closed" : "unassigned"
    //     }.`
    //   ).catch(() => null)
    // );
  } catch (e) {
    next(e);
  }
}

async function postSlackMessageIfNecessary(req, res, next) {
  const { initiated_by_slackbot } = req.body;
  const { ticketId } = req.params;
  if (initiated_by_slackbot) {
    return next();
  }
  next();
}

module.exports = { closeSlackChannelIfNecessary, postSlackMessageIfNecessary };
