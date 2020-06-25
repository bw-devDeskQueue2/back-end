const config = require("../../config/serverInfo");
const request = require("superagent");
const {
  getUserToken,
  createUserIfNotExists,
  baseURL,
  sendDM,
  getAdminToken,
} = require("../utils");

const modal = async () => {
  const ticketQueue = await request
    .get(`${baseURL(req)}/tickets/queue`)
    .set("Authorization", `Bearer ${getAdminToken}`)
    .then(r => r.body)
    .catch(console.log);
  console.log("queue data", ticketQueue);
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Ticket Queue",
    },
    blocks: [],
    submit: {
      type: "plain_text",
      text: "Close Queue",
    },
    //private_metadata: user,
    callback_id: "queue",
  };
};

async function handleSubmission(req, res, next, submission) {
  try {
    let {
      user: { id: slack_id, team_id },
      view: {
        state: { values: formData },
      },
    } = submission;
    console.log("queue handler", slack_id, team_id, formData);
  } catch (e) {
    next(e);
  }
}
module.exports = {
  modal,
  handleSubmission,
  actionName: "queue",
  description: "View the open ticket queue and assign tickets to yourself.",
};
