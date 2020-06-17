const router = require("express").Router();
const Tickets = require("./ticketsModel");
const { catchAsync, AppError } = require("../config/errors");

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

router.get(
  "/:ticketId",
  validateTicketPermissions,
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    res.status(200).json(await Tickets.getTicketById(ticketId));
  })
);
/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function validateTicketPermissions(req, res, next) {
  const { id: userId, roles } = req.data;
  const { ticketId } = req.params;
  Tickets.getTicketById(ticketId).then(ticket => {
    if (!ticket) {
      return res
        .status(404)
        .json({ message: `No ticket found with id '${ticketId}'.` });
    }
    if (
      !(
        ticket.student.id == userId ||
        ticket.helper.id == userId ||
        roles.includes("admin")
      )
    ) {
      return res.status(403).json({
        message: "You don't have permission to view or modify this ticket",
      });
    }
    next();
  });
}

module.exports = router;
