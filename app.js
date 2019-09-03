require('dotenv').config();

const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	expressSanitizer = require('express-sanitizer'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
	Campground = require('./backend/services/models/campground'),
	Review = require('./backend/services/models/review'),
	User = require('./backend/services/models/user'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose'),
	flash = require('connect-flash');

//Requireing Routes
const campgroundsRoutes = require('./backend/routes/campgrounds'),
	reviewsRoutes = require('./backend/routes/reviews'),
	indexRoutes = require('./backend/routes/index');

//APP CONFIG
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');

//PASSPORT CONFIG
app.use(
	require('express-session')({
		secret: process.env.EXPRESS_SESSION_SECRET,
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

//APP ROUTES
app.use(indexRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

//MONGOOSE & SERVER CONNECT
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useCreateIndex: true
	})
	.then(() => {
		console.log('connected to DB!');
		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log('The YelpCamp Server Has Started!');
		});
	})
	.catch((err) => {
		console.log('ERROR:', err.message);
	});

mongoose.set('useFindAndModify', false);
