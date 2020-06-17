const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { catchAsync, AppError } = require("../config/errors");
const jwt = require("jsonwebtoken");
const Users = require("../user/userModel");
const config = require("../config/serverInfo");

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

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    roles: user.roles,
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
  const { roles } = req.body;
  if (!roles) {
    return res
      .status(400)
      .json({ message: "New users must include a 'roles' array." });
  }
  const rolesList = await Users.getRolesList();
  const rolesWithId = roles.map(userRole => {
    const found = rolesList.find(role => role.name === userRole);
    if (!found) {
      next(new AppError(`Error: ${userRole} is not a valid role name.`, 400));
    }
    return found;
  });
  req.body.roles = rolesWithId;
  next();
}

function validateUserExists(req, res, next) {
  const { username } = req.body;
  Users.getUser({ username }).then(user => {
    if (!user) {
      return res.status(404).json({
        message: `No user with username '${username}' exists`,
      });
    }
    req.user = user;
    return next();
  });
}

function validateUserDoesNotExist(req, res, next) {
  const { username } = req.body;
  Users.getUser({ username }).then(user => {
    if (user) {
      return res.status(400).json({
        message: `A user with username '${username}' already exists.`,
      });
    }
    return next();
  });
}

/* Export --------------------------------------------------------------------*/
module.exports = router;
