const Tickets = require("../tickets/ticketsModel");
const router = require("express").Router();
const { catchAsync } = require("../config/errors");

router.get(
  "/",
  disallowStudents,
  catchAsync(async (req, res) => {
    res.status(200).json(await Tickets.getTicketQueue());
  })
);

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function disallowStudents(req, res, next) {
  const { roles } = req.data;
  if (!(roles.includes("helper") || roles.includes("admin"))) {
    res
      .status(403)
      .json({ message: "Only helpers and admins may view the queue." });
  } else next();
}

module.exports = router;
