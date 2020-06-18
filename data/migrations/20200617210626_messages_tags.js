exports.up = function (knex) {
  return knex.schema
    .createTable("messages", tbl => {
      tbl.increments();
      tbl
        .integer("ticket_id")
        .notNullable()
        .unsigned()
        .references("tickets.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl
        .integer("sender_id")
        .unsigned()
        .references("users.id")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      tbl.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      tbl.string("body", 1000).notNullable();
    })
    .createTable("ticket_tags", tbl => {
      tbl
        .integer("ticket_id")
        .notNullable()
        .unsigned()
        .references("tickets.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl
        .integer("tag_id")
        .notNullable()
        .unsigned()
        .references("tags.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl.primary(["ticket_id", "tag_id"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("ticket_tags")
    .dropTableIfExists("messages");
};
