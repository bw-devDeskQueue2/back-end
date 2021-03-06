
exports.up = function(knex) {
  return knex.schema.createTable("open_private_channels", tbl=>{
    tbl.increments();
    tbl.string("channel_id").notNullable();
    tbl.string("team_id").notNullable();
    tbl.string("name").notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("open_private_channels");
};
