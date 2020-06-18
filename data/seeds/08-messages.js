exports.seed = function (knex) {
  return knex("messages").insert([
    {
      ticket_id: 1,
      sender_id: 1,
      body: "I'd like to switch from the part-time to the full-time track.",
    },
    {
      ticket_id: 1,
      sender_id: 2,
      body:
        "Hi thanks for reaching out. Be advised that this would be a permanent change.",
    },
    {
      ticket_id: 1,
      sender_id: 1,
      body: "That's fine with me - make it so!",
    },
    {
      ticket_id: 2,
      sender_id: 1,
      body:
        "I'm getting weird error messages from our team's iOS Dev when she tries to connect to my API.",
    },
    {
      ticket_id: 3,
      sender_id: 3,
      body:
        "For some reason my App works just fine, but the Login page never renders.",
    },
    {
      ticket_id: 3,
      sender_id: 2,
      body:
        "Hi thanks for reaching out. Did you remember to import the component?",
    },
    {
      ticket_id: 4,
      sender_id: 1,
      body:
        "No matter what I do, these stupid Reactstrap components are just barely off-center. Please help!",
    },
    {
      ticket_id: 4,
      sender_id: 3,
      body:
        "Hmm, you could always hack it together by manually overwriting the settings in your own CSS.",
    },
    {
      ticket_id: 5,
      sender_id: 1,
      body: "I forgot my password!",
    },
    {
      ticket_id: 5,
      sender_id: 3,
      body: "Just hit the 'forgot password' button you dingus!",
    },
  ]);
};
