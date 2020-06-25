const path = require("path");
const fs = require("fs");
let modals = {};
let submissionHandlers = {};

const directory = path.join(__dirname, "..", "handlers");
fs.readdir(directory, (err, files) => {
  if (err) {
    return console.error("Unable to read " + directory);
  }
  files.forEach(file => {
    const name = file.toString().split(".")[0];
    const { modal, handleSubmission } = require(`${directory}/${file}`);
    modals[name] = modal;
    submissionHandlers[name] = handleSubmission;
  });
});

module.exports = { modals, submissionHandlers };
