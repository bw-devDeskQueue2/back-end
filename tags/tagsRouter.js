const router = require("express").Router();
const Tags = require("./tagsModel");
const { catchAsync, AppError } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    res.status(200).json(await Tags.getTags());
  })
);

module.exports = router;
