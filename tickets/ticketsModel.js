const knex = require("../data/dbConfig");
const Tickets = require("../tags/tagsModel");

async function getUserTickets(id, role, status) {
  let ticketList = [];
  const restriction = status === "both" ? {} : { status };
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

function getTicketById(id, restriction) {
  return getDetailedTicket({ "t.id": id }).then(ticketArray =>
    ticketArray ? ticketArray[0] : null
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
            tags: await Tickets.getTicketTags(ticket.id),
          })
        )
      )
    );
}

async function updateTicket(id, changes) {
  for (property in changes) {
    if (changes[property] === null || changes[property] === undefined)
      delete changes[property];
  }
  if (changes.status) {
    const statuses = await knex("statuses");
    changes.status_id = statuses.find(
      status => status.name === changes.status
    ).id;
    delete changes.status;
  }
  return knex("tickets")
    .where({ id })
    .update(changes)
    .then(() => getTicketById(id));
}

module.exports = { getUserTickets, getTicketById, updateTicket };
