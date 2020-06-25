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
        text: "body",
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
  callback_id: "new",
};

async function handleSubmission(req, res, next, submission) {
  let {
    user: { id: slack_id, team_id },
    view: {
      state: {
        values: {
          ticket_subject: {
            subject: { value: subject },
          },
          ticket_body: {
            body: { value: body },
          },
        },
      },
    },
  } = submission;
  console.log(slack_id, team_id, subject, body);
}

module.exports = {
  modal,
  handleSubmission,
  actionName: "new",
  description: "Create a new help ticket",
};
