const router = require("express").Router();
const { catchAsync } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    res.status(200).json(req.data);
  })
);

module.exports = router;
