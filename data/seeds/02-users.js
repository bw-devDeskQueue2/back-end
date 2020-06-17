const bcrypt = require("bcryptjs");
const config = require("../../config/serverInfo");
const ADMIN_PASS = process.env.ADMIN_PASS;

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
      password: bcrypt.hashSync(
        ADMIN_PASS || "dev_admin_password",
        config.BCRYPT_ROUNDS
      ),
    },
  ]);
};
