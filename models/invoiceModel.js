const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  customerName: String,
  items: [
    {
      description: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
  