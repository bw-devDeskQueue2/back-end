const config = require("../../config/serverInfo");
const request = require("superagent");
const {
  getUserToken,
  createUserIfNotExists,
  baseURL,
  openChannel,
  getAdminToken,
  pushView,
} = require("../utils");
const SlackUsers = require("../slackUserModel");

const actionName = "queue";

const modal = async req => {
  const ticketQueue = await request
    .get(`${baseURL(req)}/tickets/queue`)
    .set("Authorization", `Bearer ${await getAdminToken()}`)
    .then(r => r.body)
    .catch(console.log);
  //console.log("queue data", ticketQueue);
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Ticket Queue",
    },
    blocks:
      ticketQueue.length === 0
        ? {
            type: "section",
            block_id: "empty_block",
            text: {
              type: "mrkdwn",
              text: "The queue is currently empty",
            },
          }
        : ticketQueue.map(({ id, subject, messages: { [0]: { body } } }) => ({
            //tags,
            type: "section",
            block_id: `ticket_${id}`,
            text: {
              type: "mrkdwn",
              text: `*${subject}*\n${body}`,
            },
            // fields: [
            //   { type: "plain_text", text: body },
            //   {
            //     type: "plain_text",
            //     text: tags.reduce((list, next) => list + "\n" + next, " "),
            //   },
            // ],
            accessory: {
              type: "button",
              action_id: `ticket_${id}_assign`,
              text: {
                type: "plain_text",
                text: "Help Student",
              },
              style: "danger",
              value: `${id}`,
            },
          })),

    submit: {
      type: "plain_text",
      text: "Done",
    },
    //private_metadata: user,
    callback_id: actionName,
  };
};

async function followUpModal(ticket_id, req) {
  const { id, subject, messages } = await request
    .get(`${baseURL(req)}/tickets/${ticket_id}`)
    .set("Authorization", `Bearer ${await getAdminToken()}`)
    .then(r => r.body)
    .catch(console.log);
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Help with Ticket",
    },
    blocks: [
      {
        type: "section",
        block_id: `ticket_${id}_subject`,
        text: {
          type: "mrkdwn",
          text: `*Subject:* ${subject}`,
        },
      },
    ]
      .concat(
        await Promise.all(
          messages.map(async ({ body, sender: { username, id } }, idx) => {
            const slackUser = await SlackUsers.getUser({ user_id: id });
            return {
              type: "section",
              block_id: `ticket_${id}_message_${idx}`,
              text: {
                type: "mrkdwn",
                text: `*${
                  slackUser ? `<@${slackUser.slack_id}>` : username
                }*\n${body}`,
              },
            };
          })
        )
      )
      .concat([
        {
          type: "input",
          block_id: "message_body",
          label: {
            type: "plain_text",
            text: "Your Response",
          },
          element: {
            action_id: "body",
            type: "plain_text_input",
            multiline: true,
            placeholder: {
              type: "plain_text",
              text: "Respond to help this user with their issue",
            },
          },
        },
      ]),
    close: {
      type: "plain_text",
      text: "Cancel",
    },
    submit: {
      type: "plain_text",
      text: "Submit Response",
    },
    private_metadata: `${id}`,
    callback_id: actionName,
  };
}

async function handleSubmission(req, res, next, submission) {
  try {
    let {
      user: { id: slack_id, team_id },
      view: {
        private_metadata: ticket_id,
        state: {
          values: {
            message_body: {
              body: { value: message },
            },
          },
        },
      },
    } = submission;
    const slackUser = { slack_id, team_id };
    console.log("queue handler", ticket_id, message);
    const userInDatabase = await createUserIfNotExists(slackUser, req);
    const userToken = await getUserToken(userInDatabase.user_id);
    const assignedTicket = await request
      .patch(`${baseURL(req)}/tickets/${ticket_id}/assign`)
      .set("Authorization", `Bearer ${userToken}`)
      .then(r => r.body)
      .catch(console.log);
    const studentSlackUser = await SlackUsers.getUser({
      user_id: assignedTicket.student.id,
    });
    await request
      .post(`${baseURL(req)}/tickets/${ticket_id}/messages`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ body: message })
      .catch(console.log);
    const messages = await Promise.all(
      assignedTicket.messages.map(async msg => ({
        ...msg,
        slackUser: await SlackUsers.getUser({ user_id: msg.sender.id }),
      }))
    );
    const channelMessage = "-----------------------------------\n"
      .concat(
        `*This is the conversation for the ticket _${assignedTicket.subject}_*\n`
      )
      .concat("-----------------------------------\n *Message History*\n")
      .concat(
        messages.map(
          msg =>
            `*${
              msg.slackUser
                ? `<@${msg.slackUser.slack_id}>`
                : msg.sender.username
            }:* ${msg.body}\n`
        )
      )
      .concat("-----------------------------------\n")
      .concat(
        "Type in this channel to discuss the ticket, or type `!close` at any time to close the ticket."
      )
      .concat(
        !studentSlackUser
          ? `\n-----------------------------------\nAny messages you type here will be sent to *${assignedTicket.student.username}*, and you'll see their replies in this channel.`
          : ""
      );
    const channelUsers =
      userInDatabase.slack_id +
      (studentSlackUser ? `,${studentSlackUser.slack_id}` : "");
    openChannel(channelUsers, channelMessage, `ddq_ticket_${ticket_id}`);
  } catch (e) {
    next(e);
  }
  return { response_action: "clear" };
}

async function handleBlockAction(req, res, next, payload) {
  try {
    let {
      trigger_id,
      user: { id: slack_id, team_id },
      actions: {
        [0]: { value: ticket_id, action_id },
      },
    } = payload;
    //console.log("queue block action", slack_id, team_id, action_id);
    //console.log("trigger", trigger_id);
    await pushView(trigger_id, await followUpModal(ticket_id, req));
  } catch (e) {
    next(e);
  }
}
module.exports = {
  modal,
  handleSubmission,
  handleBlockAction,
  actionName,
  description: "View the open ticket queue and assign tickets to yourself",
};
