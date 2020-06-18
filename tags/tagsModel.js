const knex = require("../data/dbConfig");

function getTags() {
  return knex("tags");
}

function getTicketTags(ticket_id) {
  return knex("ticket_tags")
    .where({ ticket_id })
    .join("tags", "ticket_tags.tag_id", "tags.id")
    .select("tags.name")
    .then(tags => tags.map(tag => tag.name));
}

module.exports = { getTags, getTicketTags };
