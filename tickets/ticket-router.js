const router = require("express").Router();
const { catchAsync } = require("../config/errors");

router.get(
  "/",
  catchAsync(async (req, res) => {
    console.log(req.data);
    res.status(200).json("Authenticated!");
  })
);

module.exports = router;
