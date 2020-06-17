exports.up = function (knex) {
  return knex.schema
    .createTable("users", tbl => {
      tbl.increments();
      tbl.string("username").notNullable().unique();
      tbl.string("password").notNullable();
    })
    .createTable("roles", tbl => {
      tbl.increments();
      tbl.string("name").notNullable().unique();
    })
    .createTable("user_roles", tbl => {
      tbl
        .integer("user_id")
        .notNullable()
        .unsigned()
        .references("users.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl
        .integer("role_id")
        .notNullable()
        .unsigned()
        .references("roles.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl.primary(["user_id", "role_id"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("user_roles")
    .dropTableIfExists("roles")
    .dropTableIfExists("users");
};
