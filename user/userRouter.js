const router = require("express").Router();
const { catchAsync } = require("../config/errors");
const Users = require("./userModel");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { id, username, roles } = req.data;
    res.status(200).json({ id, username, roles });
  })
);

router.delete(
  "/:idToDelete",
  catchAsync(async (req, res) => {
    const { idToDelete } = req.params;
    const { id, roles } = req.data;
    if (!Number.isInteger(parseInt(idToDelete))) {
      return res.status(404).json({
        message: `Error: id ${idToDelete} is invalid - must be an integer. `,
      });
    }
    if (!(id == idToDelete || roles.includes("admin"))) {
      res.status(403).json({
        message: "Only admins can delete users other than themselves",
      });
    } else {
      const count = await Users.deleteUser(idToDelete);
      count == 1
        ? res.status(204).end()
        : res
            .status(404)
            .json({ message: `No user found with id ${idToDelete}` });
    }
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
