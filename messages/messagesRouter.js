const router = require("express").Router();
const Messages = require("./messagesModel");
const { catchAsync } = require("../config/errors");
const { postSlackMessageIfNecessary } = require("../bot/updateSlackMiddleware");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { id } = req.ticket;
    res.status(200).json(await Messages.getTicketMessages(id));
  })
);
router.post(
  "/",
  postSlackMessageIfNecessary,
  catchAsync(async (req, res) => {
    const { id: ticket_id } = req.ticket;
    const { id: sender_id } = req.data;
    const { body } = req.body;
    if (!body) {
      res.status(400).json({ message: "New messages must include a body." });
    } else {
      res
        .status(201)
        .json(await Messages.addMessage({ sender_id, ticket_id, body }));
    }
  })
);

module.exports = router;
