const mongoose = require('mongoose');
const Review = require('./review');

const campgroundSchema = new mongoose.Schema(
	{
		name: String,
		price: String,
		image: String,
		description: String,
		location: String,
		lat: Number,
		lng: Number,
		author: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			displayName: String
		},
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Review'
			}
		]
	},
	{
		timestamps: true
	}
);

campgroundSchema.pre('remove', async function() {
	await Review.deleteMany({
		_id: {
			$in: this.reviews
		}
	});
});

module.exports = mongoose.model('Campground', campgroundSchema);
