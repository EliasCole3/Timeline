// app/models/event.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  eventId: Number,
  name: String,
  type: String,
  startDate: String,
  endDate: String,
  details: String,
});

module.exports = mongoose.model('Event', EventSchema);