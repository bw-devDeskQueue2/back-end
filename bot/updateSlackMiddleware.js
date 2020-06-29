const { closeChannel, findChannelByName, getMembers } = require("./utils");
const SlackUsers = require("./slackUserModel");

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
          req.originalUrl.includes("close") ? "closed" : "unassigned and returned to the queue"
        }.`
      ).catch(() => null)
    );
    next();
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
