const path = require("path");
const fs = require("fs");
let modals = {};

const directory = path.join(__dirname, "..", "handlers");
fs.readdir(directory, (err, files) => {
  if (err) {
    return console.error("Unable to read " + directory);
  }
  files.forEach(file => {
    const name = file.toString().split(".")[0];
    const { modal } = require(directory + "/" + file.toString());
    modals[name] = modal;
  });
});

module.exports = modals;
