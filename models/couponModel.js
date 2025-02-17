const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
        unique:true,
        required : true
    },
    couponNumber:{
        type:String
    },
    couponName:{
        type:String
    },
    description:{
        type:String
    },
    minimumPurchase:{
        type:Number
    },
    discount:{
        type:Number,
        required:true,
    },
    expirationDate:{
        type:Date,
        required: true
    },
    usageLimit:{
        type:Number,
        default:1
    },
    usedCount:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Coupons',couponSchema)