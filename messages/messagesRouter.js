const router = require("express").Router();
const Messages = require("./messagesModel");
const { catchAsync, AppError } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { id } = req.ticket;
    res.status(200).json(await Messages.getTicketMessages(id));
  })
);

module.exports = router;
