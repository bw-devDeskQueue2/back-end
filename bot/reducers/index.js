const path = require("path");
const fs = require("fs");
let modals = {};
let submissionHandlers = {};
let actionDescriptions = {};
let blockActionHandlers = {};

const directory = path.join(__dirname, "..", "handlers");
fs.readdir(directory, (err, files) => {
  if (err) {
    return console.error("Unable to read " + directory);
  }
  files.forEach(file => {
    const name = file.toString().split(".")[0];
    const {
      modal,
      handleSubmission,
      handleBlockAction,
      actionName,
      description,
    } = require(`${directory}/${file}`);
    if (!actionName) {
      return; //console.log("No actionName for", file);
    }
    actionDescriptions[actionName] = description;
    modals[actionName] = modal;
    submissionHandlers[actionName] = handleSubmission;
    blockActionHandlers[actionName] = handleBlockAction;
  });
});

module.exports = {
  modals,
  submissionHandlers,
  actionDescriptions,
  blockActionHandlers,
};
