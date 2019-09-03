const Review = require('../services/models/review'),
	Campground = require('../services/models/campground');

const middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must be logged in to do that');
	res.redirect('/login');
};

middlewareObj.checkUserCampground = (req, res, next) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err || !foundCampground) {
			console.log(err);
			req.flash('error', 'Sorry, that campground does not exist!');
			res.redirect('/campgrounds');
		} else if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
			req.campground = foundCampground;
			next();
		} else {
			req.flash('error', "You don't have permission to do that!");
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
};

middlewareObj.checkUserReview = (req, res, next) => {
	Review.findById(req.params.review_id, (err, foundReview) => {
		if (err || !foundReview) {
			console.log(err);
			req.flash('error', 'Sorry, that review does not exist!');
			res.redirect('/campgrounds');
		} else if (foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
			req.review = foundReview;
			next();
		} else {
			req.flash('error', "You don't have permission to do that!");
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
};

module.exports = middlewareObj;
