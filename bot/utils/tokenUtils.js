const Users = require("../../user/userModel");
const { generateToken } = require("../../auth/authRouter");

const getAdminToken = () =>
  Users.getUser({ username: "test_admin" }).then(generateToken);

const getUserToken = id => Users.getUser({ id }).then(generateToken);

module.exports = { getAdminToken, getUserToken };
