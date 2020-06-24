const knex = require("../data/dbConfig");

function getUser(query) {
  return knex("slack_users")
    .where(query)
    .then(results => (results.length === 0 ? null : results[0]));
}

function addUser(user) {
  const { slack_id, team_id, user_id } = user;
  return knex("slack_users")
    .insert(user)
    .then(() => getUser({ slack_id, team_id, user_id }));
}

module.exports = { getUser, addUser };
