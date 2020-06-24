const router = require("express").Router();
const config = require("../config/serverInfo");
const crypto = require("crypto");
const tsscmp = require("tsscmp");
const { decode } = require("querystring");
const bodyParser = require("body-parser");
const { catchAsync } = require("../config/errors");
const request = require("superagent");
const { modals, submissionHandlers } = require("./reducers/");

//let activeViews = [];

router.use(function attachDomain(req, res, next) {
  req.domain = `${req.protocol}://${req.get("host")}`;
  next();
});

//First, extract body as raw text for non-JSON requests
//Then, verify the signature using that body
//Then, convert the raw text body into a more useful form
router.use(
  bodyParser.text({
    type: r =>
      r.headers["content-type"] === "application/x-www-form-urlencoded",
  }),
  verifySignature,
  function convertURLEncodedToObject(r, res, next) {
    if (r.headers["content-type"] === "application/x-www-form-urlencoded") {
      r.body = decode(r.body);
    }
    next();
  }
);

router.use(function respondToChallenge(req, res, next) {
  const { challenge } = req.body;
  //debugging
  //console.log("body", req.body);
  //console.log("challenge", challenge);
  challenge ? res.status(200).json({ challenge }) : next();
});

router.post(
  "/ddq",
  catchAsync(async (req, res) => {
    const { trigger_id, text } = req.body;
    //console.log(req.body);
    if (!trigger_id) {
      return res.status(400).json({ message: "Malformed request" });
    }
    const helpMessage = `Available actions: 'help'${Object.keys(modals).map(
      name => `, '${name}'`
    )}`;
    // console.log("action length", text.length);
    // if (text.length === 0) {
    //   return res
    //     .status(200)
    //     .json({ response_type: "ephemeral", text: helpMessage });
    // }
    const action = text ? text.split(" ")[0] : "help";
    const view = modals[action];
    if (action === "help" || !view) {
      return res.status(200).json({
        response_type: "ephemeral",
        text: helpMessage,
      });
    }
    res.status(200).end();
    await request
      .post("https://slack.com/api/views.open")
      .send({ trigger_id, view })
      .set("Authorization", `Bearer ${config.OAUTH_ACCESS_TOKEN}`)
      .then(({ body }) => {
        if (!body.ok) {
          console.log("Error opening view", body);
        }
        //activeViews.push(body);
      });
  })
);

router.post("/interactive", (req, res) => {
  let { payload } = req.body;
  if (!payload) {
    return res.status(400).json({ message: "Malformed request" });
  }
  payload = JSON.parse(payload);
  if (!payload.type) {
    return res.status(400).json({ message: "Malformed request" });
  }
  try {
    if (payload.type === "view_submission") {
      const handler = payload.view.callback_id;
      submissionHandlers[handler](payload);
    }
  } catch (e) {
    next(e);
  }
  res.status(200).end();
});

router.post("/events", (req, res) => {
  //console.log(req.body);
  res.status(200).end();
});
process.env.NODE_ENV === "test" &&
  router.post("/testing", (req, res) => {
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

  if (Math.abs(Number(Date.now() / 1000) - Number(requestTimestamp)) > 60 * 5) {
    return res.status(403).json({ message: "Invalid timestamp" }).end();
  }
  //console.log("body", req.body);
  const hmac = crypto.createHmac("sha256", slackSigningSecret);
  const [version, hash] = requestSignature.split("=");
  //console.log("type", req.headers["content-type"]);
  const isJSON = req.headers["content-type"] === "application/json";
  const base = `${version}:${requestTimestamp}:${
    isJSON ? JSON.stringify(req.body) : req.body
  }`;
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
}

module.exports = router;
