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
    res.status(200).json(tickets.filter(ticket => ticket.status === "open"));
  })
);

module.exports = router;
