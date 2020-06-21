const knex = require("../data/dbConfig");

function getMessages() {
  return getDetailedMessages();
}

function getTicketMessages(ticket_id) {
  return getDetailedMessages({ ticket_id });
}

function getDetailedMessages(query = {}) {
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

function addMessage(message) {
  return knex("messages")
    .insert(message, ["id"])
    .then(([returned]) => {
      const id = returned.id || returned;
      return knex("messages").where({ id }).first();
    });
}

module.exports = { getMessages, getTicketMessages, addMessage };
