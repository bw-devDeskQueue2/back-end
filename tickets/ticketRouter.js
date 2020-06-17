const router = require("express").Router();
const Tickets = require("./ticketsModel");
const { catchAsync, AppError } = require("../config/errors");
const Users = require("../user/userModel");

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
  catchAsync(validateTicketPermissions),
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    res.status(200).json(await Tickets.getTicketById(ticketId));
  })
);

router.patch(
  "/:ticketId/update",
  catchAsync(validateTicketPermissions),
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
  catchAsync(validateTicketPermissions),
  catchAsync(lookupNewHelper),
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    const { id: helper_id } = req.newHelper;
    res.status(200).json(await Tickets.updateTicket(ticketId, { helper_id }));
  })
);

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
async function validateTicketPermissions(req, res, next) {
  const { id: userId, roles } = req.data;
  const { ticketId } = req.params;
  const ticket = await Tickets.getTicketById(ticketId);
  if (!ticket) {
    return res
      .status(404)
      .json({ message: `No ticket found with id '${ticketId}'.` });
  }
  return !(
    ticket.student.id == userId ||
    ticket.helper.id == userId ||
    roles.includes("admin")
  )
    ? res.status(403).json({
        message: "You don't have permission to view or modify this ticket",
      })
    : next();
}

async function lookupNewHelper(req, res, next) {
  const { id, username } = req.body;
  if (!(id || username)) {
    return res.status(400).json({
      message:
        "In order to modify the helper, you must include either an 'id' key or a 'username' key.",
    });
  }
  const search = id ? { id } : { username };
  const helper = await Users.getUser(search);
  if (!helper) {
    res.status(404).json({
      message: `No helper found with username '${username}' or id '${id}'.`,
    });
  } else {
    req.newHelper = helper;
    next();
  }
}

module.exports = router;
