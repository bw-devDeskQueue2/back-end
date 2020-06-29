const { closeChannel, findChannelByName } = require("./utils");
const SlackUsers = require("./slackUserModel");

async function closeSlackChannelIfNecessary(req, res, next) {
  const { initiated_by_slackbot } = req.body;
  if (initiated_by_slackbot) {
    return next();
  }
  next();
}

async function postSlackMessageIfNecessary(req, res, next) {
  const { initiated_by_slackbot } = req.body;
  const { ticketId } = req.params;
  if (initiated_by_slackbot) {
    return next();
  }
  try {
    const channel = await findChannelByName(`ddq_ticket_${ticketId}`);
    console.log("Slack channel to close\n",channel);
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { closeSlackChannelIfNecessary, postSlackMessageIfNecessary };
