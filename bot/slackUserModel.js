const knex = require("../data/dbConfig");

function getUser(query) {
  return knex("slack_users")
    .where(query)
    .then(results => (results.length === 0 ? null : results[0]));
}

//user: { slack_id, team_id, user_id }
function addUser(user) {
  return knex("slack_users")
    .insert(user)
    .then(() => getUser(user));
}

module.exports = { getUser, addUser };
