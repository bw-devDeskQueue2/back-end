const knex = require("../data/dbConfig");

function deleteUser(id) {
  return knex("users").where({ id }).delete();
}

async function addUser(newUser) {
  const { roles, ...user } = newUser;
  const [created] = await knex("users").insert(user, ["id"]);
  //sqlite3 returns the id as a number - postgres returns an object instead
  const id = created.id || created;
  await addRoles(id, roles);
  return getUser({ id });
}

function addRoles(user_id, roles) {
  const rolesToInsert = roles.map(({ id }) => ({ user_id, role_id: id }));
  return knex("user_roles").insert([...rolesToInsert]);
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
  if (!user) return null;
  const roles = await getUserRoles(user.id);
  return { ...user, roles };
}

function getRolesList() {
  return knex("roles");
}

function getUserRoles(user_id) {
  return knex("user_roles")
    .where({ user_id })
    .join("roles", "user_roles.role_id", "roles.id")
    .select("roles.name")
    .then(roles => roles.map(role => role.name));
}

module.exports = { addUser, getUsers, getUser, getRolesList, deleteUser };
