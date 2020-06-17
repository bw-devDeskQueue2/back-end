const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authenticate = require('./auth/authenticate-middleware.js');
const authRouter = require('./auth/auth-router.js');
const ticketRouter = require("./tickets/ticket-router");
const { custom404, errorHandling } = require("./config/errors");


const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.use('/api', authRouter);
server.use('/api/tickets', authenticate, ticketRouter);

server.all("*", custom404);
server.use(errorHandling);

module.exports = server;
