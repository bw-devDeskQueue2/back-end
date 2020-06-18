exports.seed = function (knex) {
  return knex("tags").insert([
    { name: "technical" },
    { name: "account" },
    { name: "node.js" },
    { name: "web" },
    { name: "react" },
    { name: "css" },
    { name: "ios" },
  ]);
};
