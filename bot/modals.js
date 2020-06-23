module.exports = {
  register: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Register",
    },
    blocks: [
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "It's Block Kit...but _in a modal_",
      //   },
      //   block_id: "section1",
      //   accessory: {
      //     type: "button",
      //     text: {
      //       type: "plain_text",
      //       text: "Click me",
      //     },
      //     action_id: "button_abc",
      //     value: "Button value",
      //     style: "danger",
      //   },
      // },
      {
        type: "input",
        label: {
          type: "plain_text",
          text: "Username",
        },
        element: {
          type: "plain_text_input",
          action_id: "input_username",
          placeholder: {
            type: "plain_text",
            text: "Enter your desired username",
          },
          multiline: false,
        },
        optional: false,
      },
      {
        type: "input",
        label: {
          type: "plain_text",
          text: "Password",
        },
        element: {
          type: "password_input",
          action_id: "input_password",
          multiline: false,
        },
        optional: false,
      },
      {
        type: "input",
        label: {
          type: "plain_text",
          text: "Confirm Password",
        },
        element: {
          type: "password_input",
          action_id: "input_password_confirmation",
          multiline: false,
        },
        optional: false,
      },
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
