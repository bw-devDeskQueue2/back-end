const router = require("express").Router();
const baseUrl = "https://devdesk-queue-2-herokuapp.com/api";
const config = require("../config/serverInfo");
const crypto = require("crypto");
const tsscmp = require("tsscmp");

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

//https://fireship.io/snippets/verify-slack-api-signing-signature-node
function verifySignature(req, res, next) {
  const slackSigningSecret = config.SIGNING_SECRET;
  const requestSignature = String(req.headers["x-slack-signature"]);
  const requestTimestamp = req.headers["x-slack-request-timestamp"];
  console.log("timestamp", requestTimestamp);
  if (Math.abs(Date.now() - Number(requestTimestamp)) > 60 * 5 * 1000) {
    console.log("invalid timestamp"); // return res.status(403).json({ message: "Invalid timestamp" });
  }
  const hmac = crypto.createHmac("sha256", slackSigningSecret);
  const [version, hash] = requestSignature.split("=");
  const base = `${version}:${requestTimestamp}:${JSON.stringify(req.body)}`;
  hmac.update(base);

  tsscmp(hash, hmac.digest("hex"))
    ? next()
    : res.status(403).json({ message: "invalid signature" });
}

module.exports = router;
