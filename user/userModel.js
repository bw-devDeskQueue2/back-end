const knex = require("../data/dbConfig");

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

async function getUser(search) {
  const user = await knex("users").where(search).first();
  const roles = await getUserRoles(user.id);
  return { ...user, roles };
}

function getUserRoles(user_id) {
  return knex("user_roles")
    .where({ user_id })
    .join("roles", "user_roles.role_id", "roles.id")
    .select("roles.name")
    .then(roles => roles.map(role => role.name));
}

module.exports = { addUser, getUsers, getUser };
