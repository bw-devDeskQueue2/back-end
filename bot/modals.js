module.exports = {
  register: {
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
        block_id: "info"
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
        type: "actions",
        block_id: "actions1",
        elements: [
          {
            type: "static_select",
            placeholder: {
              type: "plain_text",
              text: "Choose your role(s)",
            },
            action_id: "role_select",
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
        ],
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
    private_metadata: "Shhhhhhhh",
    callback_id: "registration_form",
  },
};
