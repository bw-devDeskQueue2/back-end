const router = require("express").Router();
const Messages = require("./messagesModel");
const { catchAsync, AppError } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    res.status(200).json(await Messages.getMessages());
  })
);

module.exports = router;
