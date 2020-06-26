const config = require("../../config/serverInfo");
const request = require("superagent");
const {
  getUserToken,
  createUserIfNotExists,
  baseURL,
  sendDM,
  getAdminToken,
  pushView,
} = require("../utils");
const SlackUsers = require("../slackUserModel");

const actionName = "queue";

const modal = async req => {
  const ticketQueue = await request
    .get(`${baseURL(req)}/tickets/queue`)
    .set("Authorization", `Bearer ${await getAdminToken()}`)
    .then(r => r.body)
    .catch(console.log);
  //console.log("queue data", ticketQueue);
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Ticket Queue",
    },
    blocks:
      ticketQueue.length === 0
        ? {
            type: "section",
            block_id: "empty_block",
            text: {
              type: "mrkdwn",
              text: "The queue is currently empty",
            },
          }
        : ticketQueue.map(({ id, subject, messages: { [0]: { body } } }) => ({
            //tags,
            type: "section",
            block_id: `ticket_${id}`,
            text: {
              type: "mrkdwn",
              text: `*${subject}*\n${body}`,
            },
            // fields: [
            //   { type: "plain_text", text: body },
            //   {
            //     type: "plain_text",
            //     text: tags.reduce((list, next) => list + "\n" + next, " "),
            //   },
            // ],
            accessory: {
              type: "button",
              action_id: `ticket_${id}_assign`,
              text: {
                type: "plain_text",
                text: "Help Student",
              },
              style: "danger",
              value: `${id}`,
            },
          })),

    submit: {
      type: "plain_text",
      text: "Done",
    },
    //private_metadata: user,
    callback_id: actionName,
  };
};

async function followUpModal(ticket_id, req) {
  const { id, subject, messages } = await request
    .get(`${baseURL(req)}/tickets/${ticket_id}`)
    .set("Authorization", `Bearer ${await getAdminToken()}`)
    .then(r => r.body)
    .catch(console.log);
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Help with Ticket #" + ticket_id,
    },
    blocks: [
      {
        type: "section",
        block_id: `ticket_${id}_subject`,
        text: {
          type: "mrkdwn",
          text: `*${subject}*`,
        },
      },
    ].concat(
      messages.map(({ body, sender: { username, id } }, idx) => {
        const slackUser = await SlackUsers.getUser({user_id: id});
        return {
          type: "section",
          block_id: `ticket_${id}_message_${idx}`,
          text: {
            type: "mrkdwn",
            text: `*${
              slackUser ? `<@${slackUser.slack_id}>` : username
            }*\n${body}`,
          },
        };
      })
    ),
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    submit: {
      type: "plain_text",
      text: "Submit Response",
    },
    //private_metadata: user,
    callback_id: actionName,
  };
}

async function handleSubmission(req, res, next, submission) {
  try {
    let {
      user: { id: slack_id, team_id },
      view: {
        state: { values: formData },
      },
    } = submission;
    console.log("queue handler", slack_id, team_id, formData);
  } catch (e) {
    next(e);
  }
  return { response_action: "clear" };
}

async function handleBlockAction(req, res, next, payload) {
  try {
    let {
      trigger_id,
      user: { id: slack_id, team_id },
      actions: {
        [0]: { value: ticket_id, action_id },
      },
    } = payload;
    console.log("queue block action", slack_id, team_id, action_id);
    console.log("trigger", trigger_id);
    await pushView(trigger_id, await followUpModal(ticket_id, req));
  } catch (e) {
    next(e);
  }
}
module.exports = {
  modal,
  handleSubmission,
  handleBlockAction,
  actionName,
  description: "View the open ticket queue and assign tickets to yourself",
};
