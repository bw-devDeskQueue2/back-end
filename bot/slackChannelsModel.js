const knex = require("../data/dbConfig");

function addChannel(channel) {
  const { channel_id, team_id, name } = channel;
  if (!(channel_id && team_id && name)) {
    return new Error("Cannot add channel without all required info");
  }
  return knex("open_private_channels")
    .insert({ channel_id, team_id, name })
    .then(() => findChannel({ channel_id, team_id, name }));
}

function findChannel(query) {
  return knex("open_private_channels")
    .where(query)
    .then(r => (r.length === 0 ? null : r[0]));
}

module.exports = { addChannel, findChannel };
