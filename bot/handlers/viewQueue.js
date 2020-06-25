const config = require("../../config/serverInfo");
const request = require("superagent");
const {
  getUserToken,
  createUserIfNotExists,
  baseURL,
  sendDM,
  getAdminToken,
} = require("../utils");

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
    callback_id: "queue",
  };
};

// async function handleSubmission(req, res, next, submission) {
//   try {
//     let {
//       user: { id: slack_id, team_id },
//       view: {
//         state: { values: formData },
//       },
//     } = submission;
//     console.log("queue handler", slack_id, team_id, formData);
//   } catch (e) {
//     next(e);
//   }
// }

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
  } catch (e) {
    next(e);
  }
}
module.exports = {
  modal,
  //handleSubmission,
  handleBlockAction,
  actionName: "queue",
  description: "View the open ticket queue and assign tickets to yourself.",
};
