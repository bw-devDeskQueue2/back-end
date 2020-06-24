const knex = require("../data/dbConfig");

function getUser(query) {
  return knex("slack_users")
    .where(query)
    .then(results => (results.length === 0 ? null : results[0]));
}

module.exports = { getUser };
