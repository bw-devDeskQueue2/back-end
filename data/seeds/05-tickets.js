exports.seed = function (knex) {
  return knex("tickets")
    .insert([
      { subject: "Switching to FT from PT", student_id: 1, helper_id: 2 },
      { subject: "Can't log in to ZohoMail", student_id: 1 },
      { subject: "Issues with my Labs Team", student_id: 3 },
      { subject: "Git Bash Installation Help", student_id: 1, helper_id: 3 },
    ])
    .then(() =>
      knex("tickets").insert([
        { subject: "Forgot password", student_id: 1, status_id: 2 },
      ])
    );
};
