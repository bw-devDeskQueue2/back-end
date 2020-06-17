const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authenticate = require("./auth/authMiddleware.js");
const authRouter = require("./auth/authRouter.js");
const userRouter = require("./user/userRouter");
const ticketRouter = require("./tickets/ticketRouter");
const { custom404, errorHandling } = require("./config/errors");

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.use("/api/user", authRouter);
server.use("/api/user", authenticate, userRouter);
server.use("/api/tickets", authenticate, ticketRouter);

server.all("*", custom404);
server.use(errorHandling);

module.exports = server;
