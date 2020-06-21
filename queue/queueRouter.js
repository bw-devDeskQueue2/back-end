const Tickets = require("../tickets/ticketsModel");
const router = require("express").Router();
const {catchAsync} = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    res.status(200).json(await Tickets.getTicketQueue());
  })
);

module.exports = router;
