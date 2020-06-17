const router = require("express").Router();
const { catchAsync } = require("../config/errors");
const Users = require("./userModel");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { subject: id, username, roles } = req.data;
    res.status(200).json({ id, username, roles });
  })
);

router.get(
  "/all",
  restrictToAdmin,
  catchAsync(async (req, res) => {
    const userList = await Users.getUsers();
    res.status(200).json(userList.map(({ password, ...user }) => user));
  })
);
/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function restrictToAdmin(req, res, next) {
  const { roles } = req.data;
  if (!roles.includes("admin")) {
    res.status(403).json({ message: "You must be an admin to do that" });
  } else next();
}

module.exports = router;
