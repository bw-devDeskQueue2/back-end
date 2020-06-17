exports.seed = function (knex) {
  return knex("statuses").insert([{ name: "open" }, { name: "closed" }]);
};
