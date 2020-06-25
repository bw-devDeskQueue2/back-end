const config = require("../../config/serverInfo");
const request = require("superagent");
const { getUserToken, createUserIfNotExists, baseURL } = require("../utils");

const modal = {
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
        action_id: "task-title-value",
        placeholder: {
          type: "plain_text",
          text: "Summarize your issue",
        },
      },
    },
    {
      type: "input",
      block_id: "Ticket_body",
      label: {
        type: "plain_text",
        text: "Ticket description",
      },
      element: {
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
  callback_id: "new",
};

async function handleSubmission(req, res, next, submission) {
  let {
    user: { id: userID, team_id },
    view: {
      state: { values: formData },
    },
  } = submission;
  console.log(formData);
}

module.exports = {
  modal,
  handleSubmission,
  actionName: "new",
  description: "Create a new help ticket",
};
