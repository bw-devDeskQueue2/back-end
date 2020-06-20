const router = require("express").Router();
const baseUrl = "https://devdesk-queue-2-herokuapp.com/api";
const config = require("../config/serverInfo");
const crypto = require("crypto");

router.use(verifySignature);
router.use(function respondToChallenge(req, res, next) {
  const { challenge } = req.body;
  challenge ? res.status(200).json({ challenge }) : next();
});

router.post("/events", (req, res) => {
  console.log(req.body);
  res.status(204).end();
});

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/
function verifySignature(req, res, next) {
  const signature = req.headers["x-slack-signature"];
  const timestamp = req.headers["x-slack-request-timestamp"];
  const hmac = crypto.createHmac("sha256", config.SIGNING_SECRET);
  const [version, hash] = signature.split("=");

  hmac.update(`${version}:${timestamp}:${req.rawBody}`);

  hmac.digest("hex") === hash
    ? next()
    : res.status(403).json({ message: "Invalid slack signature" });
}

module.exports = router;
