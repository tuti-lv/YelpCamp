const express = require('express'),
	router = express.Router({ mergeParams: true }),
	Review = require('../services/models/review'),
	Campground = require('../services/models/campground'),
	middleware = require('../middleware');

//NewRoute
router.get('/new', middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) return next(err);
		res.render('reviews/new', { campground: foundCampground });
	});
});

//CreateRoute
router.post('/', middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
			res.redirect('/campgrounds');
		} else {
			Review.create(req.body.review, (err, review) => {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					review.author.id = req.user._id;
					review.author.displayName = req.user.displayName;
					review.save();
					//add reviews to campground
					foundCampground.reviews.push(review);
					foundCampground.save();
					res.redirect('/campgrounds/' + req.params.id);
				}
			});
		}
	});
});

//EditRoute
router.get('/:review_id/edit', middleware.isLoggedIn, middleware.checkUserReview, (req, res) => {
	Review.findById(req.params.review_id, (err, foundReview) => {
		res.render('reviews/edit', { review: foundReview, campgroundId: req.params.id });
	});
});

//UpdateRoute
router.put('/:review_id', middleware.isLoggedIn, middleware.checkUserReview, (req, res) => {
	updatedText = req.sanitize(req.body.review.text);
	Review.findByIdAndUpdate(req.params.review_id, req.body.review, (err) => {
		if (err) return next(err);
		res.redirect('/campgrounds/' + req.params.id);
	});
});

//DeleteRoute
router.delete('/:review_id', middleware.isLoggedIn, middleware.checkUserReview, (req, res) => {
	Review.findById(req.params.review_id, (err, foundReview) => {
		if (err) return next(err);
		//Delete review from campground reviews array
		Campground.findById(req.params.id, function(err, campground) {
			if (err) return next(err);
			const reviewIdx = campground.reviews.indexOf(req.params.review_id);
			campground.reviews.splice(reviewIdx, 1);
			campground.save();
		});
		//Delete review from DB
		foundReview.remove();
		// req.flash('success', 'Review deleted successfully!');
		res.redirect('/campgrounds/' + req.params.id);
	});
});

module.exports = router;
