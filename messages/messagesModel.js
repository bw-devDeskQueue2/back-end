const knex = require("../data/dbConfig");

function getMessages() {
  return getDetailedMessages({});
}

function getTicketMessages(ticket_id) {
  return getDetailedMessages({ ticket_id });
}

function getDetailedMessages(query) {
  return knex("messages as m")
    .where(query)
    .join("users as u", "m.sender_id", "u.id")
    .select("u.username", "u.id as user_id", "m.id", "m.created_at", "m.body")
    .then(messages =>
      messages.map(({ username, user_id: id, ...message }) => ({
        ...message,
        sender: { id, username },
      }))
    );
}

module.exports = { getMessages, getTicketMessages };
