const knex = require("../data/dbConfig");
const Users = require("../user/userModel");

async function getUserTickets(id, role) {
  let ticketList = [];
  switch (role) {
    case "student":
      ticketList = await knex("tickets").where({ student_id: id });
      break;
    case "helper":
      ticketList = await knex("tickets").where({ helper_id: id });
      break;
    case "both":
      ticketList = ticketList
        .concat(await knex("tickets").where({ student_id: id }))
        .concat(await knex("tickets").where({ helper_id: id }));
      break;
  }
  return ticketList;
}

module.exports = { getUserTickets };
