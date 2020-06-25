const config = require("../../config/serverInfo");
const request = require("superagent");
const {
  getUserToken,
  createUserIfNotExists,
  baseURL,
  sendDM,
} = require("../utils");

const modal = () => ({
  type: "modal",
  title: {
    type: "plain_text",
    text: "New Ticket",
  },
  blocks: [
    {
      type: "input",
      block_id: "ticket_subject",
      label: {
        type: "plain_text",
        text: "Subject",
      },
      element: {
        type: "plain_text_input",
        action_id: "subject",
        placeholder: {
          type: "plain_text",
          text: "Summarize your issue",
        },
      },
    },
    {
      type: "input",
      block_id: "ticket_body",
      label: {
        type: "plain_text",
        text: "Ticket description",
      },
      element: {
        action_id: "body",
        type: "plain_text_input",
        multiline: true,
        placeholder: {
          type: "plain_text",
          text: "Describe your issue in more depth",
        },
      },
    },
  ],
  close: {
    type: "plain_text",
    text: "Cancel",
  },
  submit: {
    type: "plain_text",
    text: "Submit Ticket",
  },
  //private_metadata: user,
  callback_id: "queue",
});

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
}
module.exports = {
  modal,
  handleSubmission,
  actionName: "queue",
  description: "View the open ticket queue and assign tickets to yourself.",
};
