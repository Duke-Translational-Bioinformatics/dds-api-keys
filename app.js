var path = require("path");
var express = require("express");
var app = express();
var helmet = require("helmet");
var winston = require("winston");
const port = 8080;

// log everything to stdout for use in kubernetes
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true
    })
  ],
  exitOnError: false
});

console.log("NODE ENV IS:", process.env.NODE_ENV);
app.use(helmet());
app.use(express.static(path.join(__dirname, "dist")));

// k8s liveness and readyness probe entrypoint
app.get('/alive_and_ready', function (req, res) {
  res.json({ status: 'alive and ready' })
});

app.get("/*", function(req, res) {
  res.render("index");
});

app.listen(port, function() {
  logger.info(`dds-api-keys listening on port ${port}!`);
});
