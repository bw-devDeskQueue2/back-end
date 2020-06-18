const knex = require("../data/dbConfig");
const Tickets = require("../tickets/ticketsModel");

function getTags(query = {}) {
  return knex("tags").where(query);
}

function getTicketTags(ticket_id) {
  return knex("ticket_tags")
    .where({ ticket_id })
    .join("tags", "ticket_tags.tag_id", "tags.id")
    .select("tags.name")
    .then(tags => tags.map(tag => tag.name));
}

function addTag(name) {
  return knex("tags")
    .insert({ name }, ["id"])
    .then(([returned]) => {
      const id = returned.id || returned;
      return knex("tags").where({ id }).first();
    });
}

function addTicketTag(ticket_id, tag_id) {
  return knex("ticket_tags").insert({ ticket_id, tag_id });
}

module.exports = { getTags, getTicketTags, addTag, addTicketTag };
