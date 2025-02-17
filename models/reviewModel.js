const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products',
        required:true
    },
    rating:{
    type:Number,
   },
   comment:{
    type:String
   },

});

module.exports = mongoose.model('Reviews',reviewSchema)