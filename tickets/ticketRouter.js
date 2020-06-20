const router = require("express").Router();
const Tickets = require("./ticketsModel");
const { catchAsync, AppError } = require("../config/errors");
const Users = require("../user/userModel");
const messagesRouter = require("../messages/messagesRouter");
const Validator = require("jsonschema").Validator;

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

router.post(
  "/",
  catchAsync(validateTicketObject),
  catchAsync(async (req, res, next) => {
    const { id: student_id } = req.data;
    const ticket = await Tickets.addTicket({ ...req.body, student_id });
    if (!ticket) {
      next(
        new AppError(`Internal server error while creating the ticket`, 500)
      );
    } else res.status(201).json(ticket);
  })
);

router.patch(
  "/:ticketId/update",
  catchAsync(validateTicketPermissions),
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    const { status, rating, tags, subject } = req.body;
    if (!(status || rating || tags || subject)) {
      return res.status(400).json({
        message:
          "You must supply something to update. Valid keys include 'status', 'rating', 'tags', and 'subject'.",
      });
    }
    res
      .status(200)
      .json(await Tickets.updateTicket(ticketId, { status, rating, tags, subject }));
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

router.patch(
  "/:ticketId/close",
  catchAsync(validateTicketPermissions),
  catchAsync(async (req, res) => {
    const { ticketId } = req.params;
    res
      .status(200)
      .json(
        await Tickets.updateTicket(ticketId, {
          helper_id: null,
          status: "closed",
        })
      );
  })
);

router.use(
  "/:ticketId/messages",
  catchAsync(validateTicketPermissions),
  catchAsync(async (req, res, next) => {
    const { ticketId } = req.params;
    req.ticket = await Tickets.getTicketById(ticketId);
    next();
  }),
  messagesRouter
);

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
const ticketSchema = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
  required: ["subject", "body"],
};
async function validateTicketObject(req, res, next) {
  const v = new Validator();
  const { errors } = v.validate(req.body, ticketSchema);
  errors.length === 0 ? next() : next(errors);
}

async function validateTicketPermissions(req, res, next) {
  const { id: userId, roles } = req.data;
  const { ticketId } = req.params;
  if (!Number.isInteger(parseInt(ticketId))) {
    return res.status(404).json({
      message: `Error: id ${ticketId} is invalid - must be an integer. `,
    });
  }
  const ticket = await Tickets.getTicketById(ticketId);
  if (!ticket) {
    return res
      .status(404)
      .json({ message: `No ticket found with id '${ticketId}'.` });
  }
  return !(
    ticket.student.id == userId ||
    ticket.helper.id == userId ||
    roles.includes("admin") ||
    (roles.includes("helper") && ticket.helper.id === null)
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
  } else if (!helper.roles.includes("helper")) {
    res.status(400).json({
      message: `Error: Tickets can only be assigned to users with the 'helper' role.`,
    });
  } else {
    req.newHelper = helper;
    next();
  }
}

module.exports = router;
