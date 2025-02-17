const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			
		},
		orderItems: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Products",
					required: true,
				},
				
				quantity: {
					type: Number,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
			},
		],

		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		address: {
			type: Object,
			required: true,
		},
		totalPrice: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			default: "PROCESSING",
		},
		payment: {
			type: Boolean,
			default: false,
		},
		paymentInfo: {
			id: {
				type: String,
			},
			status: {
				type: String,
			},
			type: {
				type: String,
			},
			details: {
				type: Object,
			},
		},
		paidAt: {
			type: Date,
		},
		deliveredAt: {
			type: Date,
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);