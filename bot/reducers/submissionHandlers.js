const path = require("path");
const fs = require("fs");
let submissionHandlers = {};

const directory = path.join(__dirname, "..", "handlers");
fs.readdir(directory, (err, files) => {
  if (err) {
    return console.error("Unable to read " + directory);
  }
  files.forEach(file => {
    const name = file.toString().split(".")[0];
    const { handleSubmission } = require(directory + "/" + file.toString());
    submissionHandlers[name] = handleSubmission;
  });
});

module.exports = submissionHandlers;
