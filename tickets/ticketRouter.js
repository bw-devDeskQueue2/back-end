const router = require("express").Router();
const Tickets = require("./ticketsModel");
const { catchAsync, AppError } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    let { role = "both", status = "both" } = req.query;
    const { roles, id } = req.data;
    if (roles.length === 1) {
      role = roles[0];
    }
    const validRoles = ["student", "helper", "both"];
    const validStatuses = ["open", "closed", "both"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        message:
          "Error: invalid role. Must be one of 'student', 'helper', or 'both'.",
      });
    } else if (!validStatuses.includes(status)) {
      res.status(400).json({
        message:
          "Error: invalid status. Must be one of 'open', 'closed', or 'both'.",
      });
    } else res.status(200).json(await Tickets.getUserTickets(id, role, status));
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

router.patch(
  "/:ticketId/update",
  validateTicketPermissions,
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    const { status, rating } = req.body;
    if (!(status || rating)) {
      return res.status(400).json({
        message:
          "You must supply something to update. Valid keys include 'status', and 'rating'.",
      });
    }
    res
      .status(200)
      .json(await Tickets.updateTicket(ticketId, { status, rating }));
  })
);

router.patch(
  "/:ticketId/reassign",
  validateTicketPermissions,
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    const { id, username } = req.body;
    if (!(id || username)) {
      return res.status(400).json({
        message:
          "In order to modify the helper, you must include either an 'id' key or a 'username' key.",
      });
    }
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
