const knex = require("../data/dbConfig");
const Tags = require("../tags/tagsModel");
const Messages = require("../messages/messagesModel");

async function getUserTickets(id, role, status) {
  let ticketList = [];
  const restriction = status === "both" ? {} : { "statuses.name": status };
  switch (role) {
    case "student":
      ticketList = await getDetailedTicket({ student_id: id }, restriction);
      break;
    case "helper":
      ticketList = await getDetailedTicket({ helper_id: id }, restriction);
      break;
    case "both":
      ticketList = ticketList
        .concat(await getDetailedTicket({ student_id: id }, restriction))
        .concat(await getDetailedTicket({ helper_id: id }, restriction));
      break;
    default:
      ticketList = null;
  }
  return ticketList;
}

function getTicketById(id) {
  return getDetailedTicket({ "t.id": id }).then(ticketArray =>
    ticketArray ? ticketArray[0] : null
  );
}

async function getTicketsByTag(tag_id) {
  const ticketTags = await knex("ticket_tags").where({ tag_id });
  if (ticketTags.length === 0) return null;
  return Promise.all(
    ticketTags.map(({ ticket_id }) => getTicketById(ticket_id))
  );
}

function getDetailedTicket(query, restriction = {}) {
  return knex("tickets as t")
    .where(query)
    .join("statuses", "t.status_id", "statuses.id")
    .join("users as s", "t.student_id", "s.id")
    .leftJoin("users as h", "t.helper_id", "h.id")
    .select(
      "t.id",
      "t.subject",
      "t.student_id",
      "s.username as student_name",
      "t.helper_id",
      "h.username as helper_name",
      "statuses.name as status",
      "t.rating"
    )
    .where(restriction)
    .then(tickets =>
      Promise.all(
        tickets.map(
          async ({
            student_id,
            student_name,
            helper_id,
            helper_name,
            ...ticket
          }) => ({
            ...ticket,
            student: { id: student_id, username: student_name },
            helper: { id: helper_id, username: helper_name },
            tags: await Tags.getTicketTags(ticket.id),
            messages: await Messages.getTicketMessages(ticket.id),
          })
        )
      )
    );
}

async function updateTicket(id, changes) {
  for (property in changes) {
    if (changes[property] === undefined) delete changes[property];
  }
  if (changes.status) {
    const statuses = await knex("statuses");
    changes.status_id = statuses.find(
      status => status.name === changes.status
    ).id;
    delete changes.status;
  }
  if (changes.tags) {
    //clear all existing ticket tags
    await knex("ticket_tags").where({ ticket_id: id }).delete();
    //add ticket tags, creating new tags as necessary
    const existingTags = await Tags.getTags();
    await Promise.all(
      changes.tags.map(async tag => {
        const found = existingTags.find(eT => eT.name === tag.toLowerCase());
        if (found) {
          await Tags.addTicketTag(id, found.id);
        } else {
          const newTag = await Tags.addTag(tag.toLowerCase());
          await Tags.addTicketTag(id, newTag.id);
        }
      })
    );
    //remove the tags property so it doesn't interfere with the next step
    delete changes.tags;
  }
  return knex("tickets")
    .where({ id })
    .update(changes)
    .then(() => getTicketById(id));
}

async function addTicket({ body, tags, ...ticket }) {
  const [created] = await knex("tickets").insert(ticket, ["id"]);
  //sqlite3 returns the id as a number - postgres returns an object instead
  const id = created.id || created;
  await Messages.addMessage({
    ticket_id: id,
    sender_id: ticket.student_id,
    body,
  });
  const existingTags = await Tags.getTags();
  if (tags && tags.length !== 0) {
    await Promise.all(
      tags.map(async tag => {
        const found = existingTags.find(eT => eT.name === tag.toLowerCase());
        if (found) {
          await Tags.addTicketTag(id, found.id);
        } else {
          const newTag = await Tags.addTag(tag.toLowerCase());
          await Tags.addTicketTag(id, newTag.id);
        }
      })
    );
  }
  return getTicketById(id);
}

function getTicketQueue() {
  return getDetailedTicket(
    {},
    { status: "open", "t.helper_id": null }
    //older tickets have smaller IDs and should appear earlier in the queue
    //They should already be in that order, but this sort ensures no funny business happens
  ).then(tickets =>
    tickets
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .map((t, idx) => ({ queue_position: idx + 1, ...t }))
  );
}

module.exports = {
  getTicketQueue,
  getUserTickets,
  getTicketById,
  getTicketsByTag,
  updateTicket,
  addTicket,
};
