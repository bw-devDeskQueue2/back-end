const knex = require("../../data/dbConfig");

function getUser(query) {
  return knex("slack_users").where(query).first();
}

module.exports = { getUser };
