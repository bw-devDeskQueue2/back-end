exports.seed = function (knex) {
  return knex("user_roles").insert([
    {
      user_id: 1,
      role_id: 1,
    },
    {
      user_id: 2,
      role_id: 2,
    },
  ]);
};
