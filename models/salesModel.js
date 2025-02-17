
const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema({
  month: String,
  amount: Number
});

module.exports = mongoose.model('Sales', SalesSchema);
