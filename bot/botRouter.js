const router = require("express").Router();
const baseUrl = "https://devdesk-queue-2-herokuapp.com/api";
const config = require("../config/serverInfo");
const crypto = require("crypto");

//router.use(verifySignature);

router.post("/events_verify", (req, res) => {
  res.status(200).json({ challenge: req.challenge });
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
