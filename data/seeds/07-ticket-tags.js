//1 - technical, 2 - account, 3 - node, 4 - web, 5 - react, 6 - css, 7 - ios
exports.seed = function (knex) {
  return knex("ticket_tags").insert([
    { ticket_id: 1, tag_id: 2 },
    { ticket_id: 2, tag_id: 1 },
    { ticket_id: 2, tag_id: 3 },
    { ticket_id: 2, tag_id: 4 },
    { ticket_id: 2, tag_id: 7 },
    { ticket_id: 3, tag_id: 1 },
    { ticket_id: 3, tag_id: 4 },
    { ticket_id: 3, tag_id: 5 },
    { ticket_id: 4, tag_id: 1 },
    { ticket_id: 4, tag_id: 4 },
    { ticket_id: 4, tag_id: 5 },
    { ticket_id: 4, tag_id: 6 },
    { ticket_id: 5, tag_id: 2 },
    { ticket_id: 5, tag_id: 7 },
  ]);
};
