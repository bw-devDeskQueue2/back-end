const knex = require("../data/dbConfig");

function getUser(query) {
  return knex("slack_users")
    .where(query)
    .then(results => (results.length === 0 ? null : results[0]));
}

function addUser({ slack_id, team_id, user_id }) {
  //console.log("inside addUser", slack_id, team_id, user_id);
  return knex("slack_users")
    .insert({ slack_id, team_id, user_id })
    .then(() => getUser({ slack_id, team_id, user_id }));
}

module.exports = { getUser, addUser };
