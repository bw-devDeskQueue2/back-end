exports.up = function (knex) {
  return knex.schema.createTable("slack_users", tbl => {
    tbl.string("slack_id").notNullable();
    tbl.string("team_id").notNullable();
    tbl.string("slack_display_name");
    tbl
      .integer("user_id")
      .notNullable()
      .unsigned()
      .primary()
      .references("users.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("slack_users");
};
