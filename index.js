const server = require('./server.js');
const config = require("./config/serverInfo");

server.listen(config.PORT, () => {
  console.log(`\n=== Server listening on port ${config.PORT} ===\n`);
});
