const Users = require("../../user/userModel");
const { generateToken } = require("../../auth/authRouter");

function getAdminToken() {
  return Users.getUser({ username: "test_admin" }).then(generateToken);
}

function getUserToken(id) {
  return Users.getUser({ id }).then(generateToken);
}

module.exports = { getAdminToken, getUserToken };
