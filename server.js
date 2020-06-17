const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require("./config/serverInfo");

const session = require("express-session");
const knexSessionStore = require("connect-session-knex")(session);

const sessionDuration = 1000 * 60 * 60 * 24;

const sessionConfig = {
  name: config.COOKIE_NAME,
  secret: config.SESSION_SECRET,
  cookie: {
    maxAge: sessionDuration,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,

  store: new knexSessionStore({
    knex: require("./database/dbConfig"),
    tableName: "session",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: sessionDuration,
  }),
};

const authenticate = require('./auth/authenticate-middleware.js');
const authRouter = require('./auth/auth-router.js');
const { custom404, errorHandling } = require("./config/errors");


const server = express();

server.use(helmet());
server.use(session(sessionConfig));
server.use(cors({ origin: true, credentials: true}));
server.use(express.json());

server.use('/api/auth', authRouter);

server.all("*", custom404);
server.use(errorHandling);

module.exports = server;
