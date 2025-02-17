const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true },
  name: { 
    type: String,
     required: true },
 street: { 
      type: String,
       required: true },
  city: { 
    type: String,
     required: true },
  state: { 
    type: String,
     required: true },
  zip: { 
    type: String,
     required: true },
  isDefault: { 
    type: Boolean,
     default: false },
});

module.exports = mongoose.model('Address', addressSchema);
