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

function deleteTags(ticket_id) {
  return knex("ticket_tags").where({ ticket_id }).delete();
}

async function updateTags(ticket_id, tags) {
  //remove any existing tags from the ticket
  await deleteTags(ticket_id);
  //add ticket tags, creating new tags as necessary
  const existingTags = await getTags();
  return Promise.all(
    tags.map(async tag => {
      const found = existingTags.find(eT => eT.name === tag.toLowerCase());
      if (found) {
        await addTicketTag(ticket_id, found.id);
      } else {
        const newTag = await addTag(tag.toLowerCase());
        await addTicketTag(ticket_id, newTag.id);
      }
    })
  );
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

module.exports = { getTags, updateTags, getTicketTags, addTag, addTicketTag };
