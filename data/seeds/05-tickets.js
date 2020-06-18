exports.seed = function (knex) {
  return knex("tickets")
    .insert([
      { subject: "Switching to FT from PT", student_id: 1, helper_id: 2 },
      { subject: "API won't connect to iPhone", student_id: 1 },
      {
        subject: "React components refusing to render",
        student_id: 3,
        helper_id: 2,
      },
      {
        subject: "Reactstrap components won't center",
        student_id: 1,
        helper_id: 3,
      },
    ])
    .then(() =>
      knex("tickets").insert([
        { subject: "Forgot password", student_id: 1, status_id: 2 },
      ])
    );
};
