const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authenticate = require("./auth/authMiddleware.js");
const authRouter = require("./auth/authRouter.js");
const userRouter = require("./user/userRouter");
const ticketRouter = require("./tickets/ticketRouter");
const tagsRouter = require("./tags/tagsRouter");
const messagesRouter = require("./messages/messagesRouter");
const { custom404, errorHandling } = require("./config/errors");

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

server.get("/", (req, res) => {
  res.status(200).json({
    api_status: "up",
  });
});

server.get("/api", (req, res) => {
  res.status(200).json({
    documentation_link:
      "https://documenter.getpostman.com/view/11312100/SzzkcHLZ",
  });
});

server.use("/api/user", authRouter);
server.use("/api/user", authenticate, userRouter);
server.use("/api/tickets", authenticate, ticketRouter);
server.use("/api/tags", tagsRouter);
process.env.NODE_ENV === "test" &&
  server.get("/api/auth_test", authenticate, (req, res) =>
    res.status(200).json(req.data)
  );

server.all("*", custom404);
server.use(errorHandling);

module.exports = server;
