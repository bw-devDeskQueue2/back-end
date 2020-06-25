const config = require("../../config/serverInfo");
const request = require("superagent");
const { getAdminToken, createUserIfNotExists, baseURL } = require("../utils");

const modal = {
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
};

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
  const userInDatabase = await createUserIfNotExists(slackUser, req, res, next);
  //console.log("user in database", userInDatabase);
  //console.log("database id", userInDatabase.user_id);

  let rolesChangeResult;
  await request
    .patch(`${baseURL(req)}/user/${userInDatabase.user_id}/roles`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ roles })
    .then(r => (rolesChangeResult = r.body))
    .catch(e => (rolesChangeResult = e.response.body));
  //console.log(rolesChangeResult);

  const responseMessage = rolesChangeResult.message
    ? `An error ocurred: ${rolesChangeResult.message}`
    : `Role(s) successfully changed: you are now \`${rolesChangeResult.roles}\``;

  request
    .post("https://slack.com/api/conversations.open")
    .send({ users: userID })
    .set("Authorization", `Bearer ${config.BOT_ACCESS_TOKEN}`)
    .then(({ body }) => {
      if (!body.ok) {
        return console.log("opening error", body);
      }
      const {
        channel: { id: channelID },
      } = body;
      return request
        .post("https://slack.com/api/chat.postMessage")
        .set("Authorization", `Bearer ${config.BOT_ACCESS_TOKEN}`)
        .send({
          username: config.BOT_USERNAME,
          channel: channelID,
          token: config.BOT_ACCESS_TOKEN,
          text: responseMessage,
        })
        .then(({ body }) => {
          if (!body.ok) {
            console.log("sending error", body);
          }
          //console.log("sent", body);
        });
    })
    .catch(console.error);
}

module.exports = { modal, handleSubmission, actionName: "roles" };
