const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		text: String,
		author: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			displayName: String
		},
		rating: {
			type: Number,
			required: 'Please provide a rating (1-5 stars).',
			min: 1,
			max: 5,
			// Adding validation to see if the entry is an integer
			validate: {
				validator: Number.isInteger,
				message: '{VALUE} is not an integer value.'
			}
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('Review', reviewSchema);
