const knex = require("./dbConfig");

function addUser(user) {
  return knex("users")
    .insert(user, ["id"])
    .then(([id]) => getUser({ id }));
}

function getUsers() {
  return knex("users").then(users =>
    users.map(({ password, ...user }) => user)
  );
}

function getUser(search) {
  return knex("users").where(search).first();
}

module.exports = { addUser, getUsers, getUser };
