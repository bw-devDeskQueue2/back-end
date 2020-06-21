const router = require("express").Router();
const Tags = require("./tagsModel");
const Tickets = require("../tickets/ticketsModel");
const authenticate = require("../auth/authMiddleware.js");

const { catchAsync } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    res.status(200).json(await Tags.getTags());
  })
);

router.get(
  "/:name",
  authenticate,
  catchAsync(async (req, res) => {
    const { roles } = req.data;
    const { name } = req.params;
    const { status = "both", assigned = "both" } = req.query;
    const validStatuses = ["open", "closed", "both"];
    const validAssignmentStates = ["true", "false", "both"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `${status} is not a valid status. Must be either 'open', 'closed', or 'both'.`,
      });
    }
    if (!validAssignmentStates.includes(assigned)) {
      return res.status(400).json({
        message: `${assigned} is not a valid assignment state. Must be either 'true', 'false', or 'both'.`,
      });
    }
    if (!(roles.includes("helper") || roles.includes("admin"))) {
      return res.status(403).json({
        message: "You must be a helper or an admin to use this endpoint.",
      });
    }
    const tags = await Tags.getTags({ name });
    if (tags.length === 0) {
      return res
        .status(404)
        .json({ message: `Error: ${name} is not a valid tag name.` });
    }
    const tag_id = tags[0].id;
    const tickets = await Tickets.getTicketsByTag(tag_id);
    res.status(200).json(
      tickets.filter(ticket => {
        const statusFilter = status === "both" || status === ticket.status;
        const assignmentFilter =
          assigned === "both" || !!ticket.helper.id ^ assigned==="false";
        return statusFilter && assignmentFilter;
      })
    );
  })
);

module.exports = router;
