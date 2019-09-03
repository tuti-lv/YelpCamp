const express = require('express'),
	router = express.Router(),
	Campground = require('../services/models/campground'),
	middleware = require('../middleware'),
	expressSanitizer = require('express-sanitizer');

const NodeGeocoder = require('node-geocoder');

const options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GOOGLE_MAPS_API_KEY,
	formatter: null
};

const geocoder = NodeGeocoder(options);

function calculateAvgRating(campground) {
	var sum = 0;
	for (let i = 0; i < campground.reviews.length; i++) {
		sum += campground.reviews[i].rating;
	}
	return (avgRating = Math.round(sum / campground.reviews.length));
}

//IndexRoute
router.get('/', (req, res) => {
	Campground.find({}, (err, allCampgrounds) => {
		if (err) return next(err);
		res.render('campgrounds/index', { campgrounds: allCampgrounds });
	});
});

//NewRoute
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

//CreateRoute
router.post('/', middleware.isLoggedIn, (req, res) => {
	const name = req.body.name,
		price = req.body.price,
		image = req.body.image,
		desc = req.body.description,
		author = {
			id: req.user._id,
			displayName: req.user.displayName
		};

	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			console.log(err);
			return res.redirect('back');
		}
		const lat = data[0].latitude;
		const lng = data[0].longitude;
		const location = data[0].formattedAddress;

		const newCampground = {
			name: name,
			price: price,
			image: image,
			description: desc,
			author: author,
			location: location,
			lat: lat,
			lng: lng
		};

		Campground.create(newCampground, (err) => {
			if (err) return next(err);
			req.flash('success', 'A new campground was added!');
			res.redirect('/campgrounds');
		});
	});
});

//ShowRoute
router.get('/:id', (req, res) => {
	Campground.findById(req.params.id).populate('reviews').exec((err, foundCampground) => {
		if (err || !foundCampground) {
			console.log(err);
			req.flash('error', 'Sorry, that campground does not exist!');
			return res.redirect('/campgrounds');
		}
		calculateAvgRating(foundCampground);
		res.render('campgrounds/show', {
			campground: foundCampground,
			avgRating: avgRating
		});
	});
});

//EditRoute
router.get('/:id/edit', middleware.isLoggedIn, middleware.checkUserCampground, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

//UpdateRoute
router.put('/:id', middleware.isLoggedIn, middleware.checkUserCampground, (req, res) => {
	req.body.campground.description = req.sanitize(req.body.campground.description);
	geocoder.geocode(req.body.campground.location, (err, data) => {
		if (err || !data.length) {
			console.log(err);
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err) => {
			if (err) {
				res.redirect('/campgrounds');
			} else {
				req.flash('success', 'Campground updated successfully!');
				res.redirect('/campgrounds/' + req.params.id);
			}
		});
	});
});

//DeleteRoute
router.delete('/:id', middleware.isLoggedIn, middleware.checkUserCampground, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) return next(err);
		foundCampground.remove();
		req.flash('success', 'Campground deleted successfully!');
		res.redirect('/campgrounds');
	});
});

module.exports = router;
