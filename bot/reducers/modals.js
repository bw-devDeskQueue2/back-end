const path = require("path");
const fs = require("fs");
const { modal: roles } = require("../handlers/roles");

let modals = { roles };
const directory = path.join(__dirname, "..", "handlers");
fs.readdirSync(directory, (err, files) => {
  if (err) {
    return console.error("Unable to read " + directory);
  }
  files.forEach(file => {
    console.log("file", file);
  });
});

module.exports = modals;
