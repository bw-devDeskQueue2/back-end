const knex = require("../data/dbConfig");

async function addUser(user) {
  const { username } = user;
  const created = await knex("users").insert(user);
  return getUser({ username });
}

async function getUsers() {
  const users = await knex("users");
  return Promise.all(
    users.map(async user => ({
      ...user,
      roles: await getUserRoles(user.id),
    }))
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
