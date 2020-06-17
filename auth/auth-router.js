const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { catchAsync } = require("../config/errors");
const db = require("../database/userModel");
const config = require("../config/serverInfo");

router.post(
  "/register",
  validateUserObject,
  validateUserDoesNotExist,
  catchAsync(async (req, res, next) => {
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, 10);
    req.user = await db.addUser(user);
    next();
  }),
  function loginAfterRegistration(req, res) {
    req.session.user = req.user;
    res.status(201).json({ ...req.user, password: "••••••••••" });
  }
);

router.post(
  "/login",
  validateUserObject,
  validateUserExists,
  catchAsync(async (req, res) => {
    const { password } = req.body;
    const { password: passwordHash } = req.user;
    if (!bcrypt.compareSync(password, passwordHash)) {
      return res.status(401).json({ message: "Invalid password" });
    }
    req.session.user = req.user;
    res.status(200).json({ message: "Logged in" });
  })
);

router.get(
  "/logout",
  catchAsync(async (req, res, next) => {
    if (req.session.user) {
      res.clearCookie(config.COOKIE_NAME);
      req.session.destroy(err =>
        err ? next(err) : res.status(200).json({ message: "Logged out" })
      );
    } else {
      res.status(400).json({ message: "You are not logged in." });
    }
  })
);
/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function validateUserObject(req, res, next) {
  const { username, password } = req.body;
  username && password
    ? next()
    : res.status(400).json({
        message: "User object requires both 'username' and 'password' fields",
      });
}

function validateUserExists(req, res, next) {
  const { username } = req.body;
  db.getUser({ username }).then(user => {
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
  db.getUser({ username }).then(user => {
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
