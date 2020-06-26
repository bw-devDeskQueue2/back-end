const router = require("express").Router();
const config = require("../config/serverInfo");
const crypto = require("crypto");
const tsscmp = require("tsscmp");
const { decode } = require("querystring");
const bodyParser = require("body-parser");
const { catchAsync } = require("../config/errors");
const {
  modals,
  submissionHandlers,
  blockActionHandlers,
  actionDescriptions,
} = require("./reducers");
const { openView } = require("./utils/slackUtils");

//First, extract body as raw text for non-JSON requests
//Then, verify the signature using that body
//Then, convert the raw text body into a more useful form
router.use(
  bodyParser.text({
    type: r =>
      r.headers["content-type"] === "application/x-www-form-urlencoded",
  }),
  verifySignature,
  function convertURLEncodedToObject(req, res, next) {
    if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
      req.body = decode(req.body);
    }
    next();
  }
);

//Respond to challenges used by slack to verify domain ownership
router.use(function respondToChallenge(req, res, next) {
  const { challenge } = req.body;
  challenge ? res.status(200).json({ challenge }) : next();
});

//This endpoint responds to the slash command '/ddq'
router.post(
  "/ddq",
  catchAsync(async (req, res) => {
    const { trigger_id, text } = req.body;
    //console.log(req.body);
    if (!trigger_id) {
      return res.status(400).json({ message: "Malformed request" });
    }
    const helpMessage =
      "*DevDesk Queue Actions:*\n" +
      "`/ddq help`: Show this help popup," +
      Object.keys(modals).map(
        name => `\n \`/ddq ${name}\`: ${actionDescriptions[name]}`
      );
    const action = text ? text.split(" ")[0] : "help";
    const view = modals[action] ? await modals[action](req) : null;
    if (action === "help" || !view) {
      return res.status(200).json({
        response_type: "ephemeral",
        text: helpMessage,
      });
    }
    res.status(200).end();
    await openView(trigger_id, view);
  })
);

//This endpoint responds to user interaction with modal views in slack
router.post(
  "/interactive",
  catchAsync(async (req, res, next) => {
    let { payload } = req.body;
    if (!payload) {
      return res.status(400).json({ message: "Malformed request" });
    }
    payload = JSON.parse(payload);
    if (!payload.type) {
      return res.status(400).json({ message: "Malformed request" });
    }
    let responseAction;
    try {
      if (payload.type === "view_submission") {
        const handler = payload.view.callback_id;
        responseAction =
          submissionHandlers[handler] &&
          (await submissionHandlers[handler](req, res, next, payload));
      } else if (payload.type === "block_actions") {
        const handler = payload.view.callback_id;
        responseAction =
          blockActionHandlers[handler] &&
          (await blockActionHandlers[handler](req, res, next, payload));
      } else {
        console.log("unhandled payload of type", payload.type);
      }
    } catch (e) {
      next(e);
    }
    res.status(200).end(responseAction || {});
  })
);

//This endpoint responds to bot events:
//DMs to the bot and @mentions
router.post("/events", (req, res) => {
  //TODO: Make this endpoint do something
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
