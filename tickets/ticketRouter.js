const router = require("express").Router();
const Tickets = require("./ticketsModel");
const { catchAsync } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    let { role = "both" } = req.query;
    const { roles, id } = req.data;
    if (roles.length === 1) {
      role = roles[0];
    }
    const validRoles = ["student", "helper", "both"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        message:
          "Error: invalid role. Must be one of 'student', 'helper', or 'both'.",
      });
    } else res.status(200).json(await Tickets.getUserTickets(id, role));
  })
);

module.exports = router;
