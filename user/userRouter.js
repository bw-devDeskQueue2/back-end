const router = require("express").Router();
const { catchAsync } = require("../config/errors");
const { generateToken, validateUserRoles } = require("../auth/authRouter");
const Users = require("./userModel");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { id } = req.data;
    const { password, ...user } = await Users.getUser({ id });
    res.status(200).json({ ...user, token: generateToken(user) });
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

router.patch(
  "/:id/roles",
  catchAsync(validateUserExists),
  restrictToAdmin,
  catchAsync(validateUserRoles),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { roles } = req.body;
    if (!Array.isArray(roles)) roles = [roles];
    await Users.addRoles(id, roles);
    const { password, ...user } = await Users.getUser({ id });
    res.status(200).json(user);
  })
);

router.patch(
  "/roles",
  catchAsync(validateUserRoles),
  catchAsync(async (req, res) => {
    const { id } = req.data;
    let { roles } = req.body;
    if (!Array.isArray(roles)) roles = [roles];
    await Users.addRoles(id, roles);
    const { password, ...user } = await Users.getUser({ id });
    res.status(200).json(user);
  })
);

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
async function validateUserExists(req, res, next) {
  const { id } = req.params;
  if (!Number.isInteger(parseInt(id))) {
    return res
      .status(404)
      .json({ message: `Invalid id '${id} - must be an integer.'` });
  }
  req.user = await Users.getUser({ id });
  req.user
    ? next()
    : res.status(404).json({ message: `No user with id '${id}' found.` });
}
function restrictToAdmin(req, res, next) {
  const { roles } = req.data;
  if (!roles.includes("admin")) {
    res.status(403).json({ message: "You must be an admin to do that" });
  } else next();
}

module.exports = router;
