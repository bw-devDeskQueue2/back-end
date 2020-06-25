const config = require("../../config/serverInfo");
const request = require("superagent");
const { getAdminToken, createUserIfNotExists, baseURL } = require("../utils");

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
          text: "Briefly describe your issue",
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
  callback_id: "roles",
};

async function handleSubmission(req, res, next, submission) {
  let {
    user: { id: userID, team_id },
    view: {
      state: {
        values: {
          role: {
            role_select: {
              selected_option: { value: formData },
            },
          },
        },
      },
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
