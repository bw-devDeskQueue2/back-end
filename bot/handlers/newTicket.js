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
  callback_id: "new",
});

async function handleSubmission(req, res, next, submission) {
  try {
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
    //console.log(slack_id, team_id, subject, body);
    const slackUser = { slack_id, team_id };
    const userInDatabase = await createUserIfNotExists(slackUser, req);
    const userToken = await getUserToken(userInDatabase.user_id);

    const { id: ticketID } = await request
      .post(`${baseURL(req)}/tickets`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ subject, body })
      .then(r => r.body)
      .catch(e =>
        console.log(e.response ? e.response.body.message : e.message)
      );
    sendDM(
      slack_id,
      ticketID
        ? `Your ticket "${subject}" was successfully created`
        : "There was an error while creating the ticket"
    );
  } catch (e) {
    next(e);
  }
}

module.exports = {
  modal,
  handleSubmission,
  actionName: "new",
  description: "Create a new help ticket",
};
