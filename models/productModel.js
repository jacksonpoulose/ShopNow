const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category:{
      type:String,
			required: true
    },
	size: {
		type: Number,
		required: true
	  },
    price: {
      type: Number,
	  required: true
    },
    discountPrice:{
      type:Number,
      required:true
    },
    stock:{
      type:Number,
	  required: true
      
    },
    images: [
			{
				url: {
					type: String,
					required: true,
				},
			},
		],
    reviews: [
			{
				_id: false,
				review: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Review",
					required: true,
				},
			},
		],
    rating: {
			type: Number,
		},
    soldOut: {
			type: Boolean,
			default: false,
		},
		totalSell: {
			type: Number,
			default: 0,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Products', productSchema);
