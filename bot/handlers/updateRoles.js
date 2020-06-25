const config = require("../../config/serverInfo");
const request = require("superagent");
const {
  getAdminToken,
  createUserIfNotExists,
  baseURL,
  sendDM,
} = require("../utils");

const modal = async () => ({
  type: "modal",
  title: {
    type: "plain_text",
    text: "Roles",
  },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Your username and password are tied to your slack account.",
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
    text: "Select Role(s)",
  },
  //private_metadata: user,
  callback_id: "roles",
});

async function handleSubmission(req, res, next, submission) {
  let {
    user: { id: userID, team_id },
    view: {
      state: {
        values: {
          role: {
            role_select: {
              selected_option: { value: roles },
            },
          },
        },
      },
    },
  } = submission;
  if (roles.includes("both")) {
    roles = ["student", "helper"];
  }
  //console.log("Submission", userID, team_id, roles);
  const adminToken = await getAdminToken(req);
  //console.log("admin token", adminToken);
  const slackUser = { slack_id: userID, team_id, roles };
  const userInDatabase = await createUserIfNotExists(slackUser, req);
  //console.log("user in database", userInDatabase);
  //console.log("database id", userInDatabase.user_id);

  let rolesChangeResult;
  await request
    .patch(`${baseURL(req)}/user/${userInDatabase.user_id}/roles`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ roles })
    .then(r => (rolesChangeResult = r.body))
    .catch(e => {
      rolesChangeResult = e.response ? e.response.body : e.message;
    });
  //console.log(rolesChangeResult);

  const responseMessage = rolesChangeResult.message
    ? `An error ocurred: ${rolesChangeResult.message}`
    : `Role(s) successfully changed: you are now \`${rolesChangeResult.roles}\``;
  await sendDM(userID, responseMessage);
}

module.exports = {
  modal,
  handleSubmission,
  actionName: "roles",
  description:
    "Change your roles (you can be a `student`, a `helper` or `both`)",
};
