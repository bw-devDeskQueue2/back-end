module.exports = {
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "the magenta orangutan persisted on a diet of ironic dichromaticism",
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 10,
  ADMIN_PASS: process.env.ADMIN_PASS || "dev_admin_pass",
  SIGNING_SECRET:
    process.env.SIGNING_SECRET ||
    "i don't need no secure fallback values when I'm backed by the fury of the flying spaghetti monster",
  CLIENT_SECRET: process.env.CLIENT_SECRET || "test_client_secret",
  OAUTH_ACCESS_TOKEN: process.env.OAUTH_ACCESS_TOKEN || "no fallback",
  BOT_ACCESS_TOKEN: process.env.BOT_ACCESS_TOKEN || "no fallback",
  GENERIC_PASSWORD: process.env.GENERIC_PASSWORD || "password",
  BOT_USERNAME: "DevDesk Queue",
};
