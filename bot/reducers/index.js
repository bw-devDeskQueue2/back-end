const path = require("path");
const fs = require("fs");
let modals = {};
let submissionHandlers = {};
let actionDescriptions = {};

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
      actionName,
      actionDescription,
    } = require(`${directory}/${file}`);
    if (!actionName) {
      console.log("No actionName for", file);
      return;
    }
    modals[actionName] = modal;
    submissionHandlers[actionName] = handleSubmission;
  });
});

module.exports = { modals, submissionHandlers, actionDescriptions };
