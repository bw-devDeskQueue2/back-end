const router = require("express").Router();
const { catchAsync } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { subject: id, username, roles } = req.data;
    res.status(200).json({ id, username, roles });
  })
);

module.exports = router;
