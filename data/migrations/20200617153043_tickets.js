exports.up = function (knex) {
  return knex.schema
    .createTable("tags", tbl => {
      tbl.increments();
      tbl.string("name").notNullable().unique();
    })
    .createTable("statuses", tbl => {
      tbl.increments();
      tbl.string("name").notNullable().unique();
    })
    .createTable("tickets", tbl => {
      tbl.increments();
      tbl.string("subject").notNullable();
      tbl
        .integer("status_id")
        .notNullable()
        .unsigned()
        .references("statuses.id")
        .defaultTo(1)
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl
        .integer("student_id")
        .notNullable()
        .unsigned()
        .references("users.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      tbl
        .integer("helper_id")
        .unsigned()
        .references("users.id")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      tbl.integer("rating");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("tickets")
    .dropTableIfExists("statuses")
    .dropTableIfExists("tags");
};
