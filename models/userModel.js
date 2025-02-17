const mongoose = require("mongoose");

const nameRegex = /^[a-zA-Z\s]{2,50}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      match: [
        nameRegex,
        "Name must be between 2 and 50 characters and contain only letters and spaces.",
      ],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    billing:{
      type:String,
     
    },
    addresses: [
      { 
        type: mongoose.Schema.Types.ObjectId, ref: 'Address'
       }
      ],
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number, default: 1 },
      },
    ],
    orders: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders' },
        orderNumber: { type: Number, default: 1 },
      }
     
    ],
    wishList: [ 
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number, default: 1 },
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Number,
      default: 0,
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
