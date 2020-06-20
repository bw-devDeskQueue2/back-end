const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { catchAsync, AppError } = require("../config/errors");
const jwt = require("jsonwebtoken");
const Users = require("../user/userModel");
const config = require("../config/serverInfo");
const authenticate = require("./authMiddleware.js");

router.post(
  "/register",
  validateUserObject,
  catchAsync(validateUserRoles),
  validateUserDoesNotExist,
  catchAsync(async (req, res, next) => {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, config.BCRYPT_ROUNDS);
    const saved = await Users.addUser(user);
    const token = generateToken(saved);
    res.status(201).json({ user: { ...saved, password: "••••••••••" }, token });
  })
);

router.post(
  "/login",
  validateUserObject,
  validateUserExists,
  catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const { password: passwordHash } = req.user;
    if (!bcrypt.compareSync(password, passwordHash)) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(await Users.getUser({ username }));
    res.status(200).json({ message: "Logged in", token });
  })
);

router.patch(
  "/change_password",
  authenticate,
  catchAsync(async (req, res) => {
    const { id } = req.data;
    let { password } = req.body;
    if (!password) {
      res.status(400).json({ message: "You must include a password" });
    } else {
      password = bcrypt.hashSync(password, config.BCRYPT_ROUNDS);
      const changedEntries = await Users.changePassword(id, password);
      if (changedEntries == 0) {
        return next(
          new AppError(
            `A database error occurred when trying to update the password`,
            500
          )
        );
      }
      const token = generateToken(await Users.getUser({ id }));
      res.status(200).json({ message: "Password successfully changed", token });
    }
  })
);

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function generateToken(theUser) {
  const { password, ...user } = theUser;
  const payload = {
    subject: user.id,
    ...user,
  };
  const options = {
    expiresIn: "7d",
  };
  return jwt.sign(payload, config.JWT_SECRET, options);
}
function validateUserObject(req, res, next) {
  const { username, password } = req.body;
  username && password
    ? next()
    : res.status(400).json({
        message: "User object requires both 'username' and 'password' fields",
      });
}

async function validateUserRoles(req, res, next) {
  let encounteredErrors = false;
  const { roles } = req.body;
  if (!roles) {
    return res
      .status(400)
      .json({ message: "New users must include a 'roles' array." });
  }
  //Only allow admin to be added to roles if the request originates from userRouter's "roles" endpoint
  if (roles.includes("admin") && !req.originalUrl.includes("roles")) {
    return res.status(403).json({
      message: "Admin users cannot be created through this endpoint.",
    });
  }
  const rolesList = await Users.getRolesList();
  if (!Array.isArray(roles)) {
    return res.status(400).json({ message: "'roles' must be an array" });
  }
  const rolesWithId = roles.map(userRole => {
    const found = rolesList.find(role => role.name === userRole);
    if (!found) {
      encounteredErrors = true;
      res
        .status(400)
        .json({ message: `Error: ${userRole} is not a valid role name.` });
    }
    return found;
  });
  req.body.roles = rolesWithId;
  if (!encounteredErrors) next();
}

function validateUserExists(req, res, next) {
  const { username } = req.body;
  Users.getUser({ username })
    .then(user => {
      if (!user) {
        return res.status(404).json({
          message: `No user with username '${username}' exists`,
        });
      }
      req.user = user;
      return next();
    })
    .catch(e => next(e));
}

function validateUserDoesNotExist(req, res, next) {
  const { username } = req.body;
  Users.getUser({ username })
    .then(user => {
      if (user) {
        return res.status(400).json({
          message: `A user with username '${username}' already exists.`,
        });
      }
      return next();
    })
    .catch(e => next(e));
}

/* Export --------------------------------------------------------------------*/
Object.assign(router, { generateToken, validateUserRoles });
module.exports = router;
