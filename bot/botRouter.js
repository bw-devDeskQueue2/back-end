const router = require("express").Router();
const baseUrl = "https://devdesk-queue-2-herokuapp.com/api";
const config = require("../config/serverInfo");
const crypto = require("crypto");
const tsscmp = require("tsscmp");

router.post("/register", verifySignature(config.CLIENT_SECRET), (req, res) => {
  console.log(req.body);
  res.status(200).json({ response_type: "in_channel", text: "You registered" });
});

router.post(
  "/events",
  verifySignature(config.SIGNING_SECRET),
  respondToChallenge,
  (req, res) => {
    //console.log(req.body);
    res.status(200).end();
  }
);
process.env.NODE_ENV === "test" &&
  router.post("/testing", (req, res) => {
    res.status(204).end();
  });

/*----------------------------------------------------------------------------*/
/* Middleware
/*----------------------------------------------------------------------------*/

//https://fireship.io/snippets/verify-slack-api-signing-signature-node
function verifySignature(slackSigningSecret) {
  return (req, res, next) => {
    const requestSignature = String(req.headers["x-slack-signature"]);
    const requestTimestamp = req.headers["x-slack-request-timestamp"];

    if (
      Math.abs(Number(Date.now() / 1000) - Number(requestTimestamp)) >
      60 * 5
    ) {
      return res.status(403).json({ message: "Invalid timestamp" }).end();
    }
    const hmac = crypto.createHmac("sha256", slackSigningSecret);
    const [version, hash] = requestSignature.split("=");
    const base = `${version}:${requestTimestamp}:${JSON.stringify(req.body)}`;
    hmac.update(base);

    //debugging
    // console.log("signature", requestSignature);
    // console.log("timestamp", requestTimestamp);

    if (tsscmp(hash, hmac.digest("hex"))) {
      //console.log("hash success");
      next();
    } else {
      //console.log("hash failure");
      res.status(403).json({ message: "Invalid signature" });
    }
  };
}

function respondToChallenge(req, res, next) {
  const { challenge } = req.body;

  //debugging
  console.log("body", req.body);
  console.log("challenge", challenge);

  challenge ? res.status(200).json({ challenge }) : next();
}

module.exports = router;
