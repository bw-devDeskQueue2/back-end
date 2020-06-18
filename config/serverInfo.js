module.exports = {
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "the magenta orangutan persisted on a diet of ironic dichromaticism",
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 10,
  ADMIN_PASS: process.env.ADMIN_PASS || "dev_admin_pass",
};
