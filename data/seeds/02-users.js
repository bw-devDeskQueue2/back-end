const bcrypt = require("bcryptjs");
const config = require("../../config/serverInfo");

exports.seed = function (knex) {
  return knex("users").insert([
    {
      username: "test_student",
      password: bcrypt.hashSync("password", config.BCRYPT_ROUNDS),
    },
    {
      username: "test_helper",
      password: bcrypt.hashSync("password", config.BCRYPT_ROUNDS),
    },
    {
      username: "test_both",
      password: bcrypt.hashSync("password", config.BCRYPT_ROUNDS),
    },
    {
      username: "test_admin",
      password: bcrypt.hashSync("password", config.BCRYPT_ROUNDS),
    },
  ]);
};
