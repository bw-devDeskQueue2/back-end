const config = require("../../config/serverInfo");
const request = require("superagent");

const modal = {
  type: "modal",
  title: {
    type: "plain_text",
    text: "Register",
  },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Your registration will use your slack username.",
      },
      block_id: "info",
    },
    // {
    //   type: "input",
    //   label: {
    //     type: "plain_text",
    //     text: "Username",
    //   },
    //   element: {
    //     type: "plain_text_input",
    //     action_id: "input_username",
    //     placeholder: {
    //       type: "plain_text",
    //       text: "Enter your desired username",
    //     },
    //     multiline: false,
    //   },
    //   optional: false,
    // },
    {
      type: "input",
      block_id: "role",
      label: {
        type: "plain_text",
        text: "Select your role(s)",
      },
      element: {
        type: "static_select",
        action_id: "role_select",
        initial_option: {
          text: {
            type: "plain_text",
            text: "Student",
          },
          value: "student",
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Student",
            },
            value: "student",
          },
          {
            text: {
              type: "plain_text",
              text: "Helper",
            },
            value: "helper",
          },
          {
            text: {
              type: "plain_text",
              text: "Both student and helper",
            },
            value: "both",
          },
        ],
      },
    },
  ],
  close: {
    type: "plain_text",
    text: "Cancel",
  },
  submit: {
    type: "plain_text",
    text: "Register",
  },
  callback_id: "register",
};

function handleSubmission(submission) {
  const {
    user: { id },
    view: {
      state: {
        values: {
          role: {
            role_select: {
              selected_option: { value },
            },
          },
        },
      },
    },
  } = submission;
  console.log(id, value);

  request
    .post("https://slack.com/api/conversations.open")
    .send({ users: id })
    .set("Authorization", `Bearer ${config.OAUTH_ACCESS_TOKEN}`)
    .then(({ body }) => {
      if (!body.ok) {
        console.log(body);
      }
      console.log("success", body);
    });
}

module.exports = { modal, handleSubmission };
