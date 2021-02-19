const EventEmitter = require("events");

class AlertEmitter extends EventEmitter {}

module.exports = new AlertEmitter();
