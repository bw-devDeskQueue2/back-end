const knex = require("../data/dbConfig");
const {catchAsync} = require("../config/errors");

function addUser(user) {
  const { username } = user;
  return knex("users")
    .insert(user, ["id"])
    .then(() => getUser({ username }));
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
