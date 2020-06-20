const router = require("express").Router();
const baseUrl = "https://devdesk-queue-2-herokuapp.com/api";

router.post("/events_verify", (req, res) => {
  res.status(200).json({ challenge: req.challenge });
});

module.exports = router;
