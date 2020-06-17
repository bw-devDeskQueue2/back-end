exports.seed = function (knex) {
  return knex("tickets").insert([
    { subject: "Switching to FT from PT", student_id: 1, helper_id: 2 },
    { subject: "Can't log in to ZohoMail", student_id: 1 },
  ]);
};
