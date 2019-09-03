const express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	User = require('../services/models/user');

// =======================
// ROOT ROUTE
// =======================

router.get('/', (req, res) => {
	res.render('landing');
});

// =======================
// AUTHENTICATION ROUTES
// =======================

//show sign up form
router.get('/register', (req, res) => {
	res.render('authentication/register');
});
//handling user sign up
router.post('/register', (req, res) => {
	const newUser = new User({ username: req.body.username, displayName: req.body.displayName });
	if (req.body.adminCode === process.env.USER_ADMIN_CODE) {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('authentication/register', { error: err.message });
		}
		passport.authenticate('local')(req, res, () => {
			req.flash('success', 'Successfully Signed Up! Nice to meet you ' + req.body.displayName);
			res.redirect('/campgrounds');
		});
	});
});

// LOGIN & LOGOUT ROUTES
router.get('/login', (req, res) => {
	res.render('authentication/login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/campgrounds',
		failureRedirect: '/login',
		failureFlash: true
	}),
	(req, res) => {}
);

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
