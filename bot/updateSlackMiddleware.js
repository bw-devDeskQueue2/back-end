const { closeChannel } = require("./utils");
const SlackUsers = require("./slackUserModel");

function closeSlackChannelIfNecessary(req, res, next) {
  const { initiated_by_slackbot } = req.body;
  if (initiated_by_slackbot) {
    return next();
  }
  next();
}

function postSlackMessageIfNecessary(req, res, next) {
  const { initiated_by_slackbot } = req.body;
  if (initiated_by_slackbot) {
    return next();
  }
  next();
}

module.exports = { closeSlackChannelIfNecessary, postSlackMessageIfNecessary };
