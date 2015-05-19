var express = require("express");
var router = express.Router();
var common = require("../common.js")
var usersModel = require("mongoose").model("User");
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user.name);
});

passport.deserializeUser(function (name, done) {
	common.User.findByName(name, function (err, user) {
		done(err, user);
	});
});

passport.use(new localStrategy({
	usernameField: 'name',
	passwordField: 'password'
}, function (name, password, done) {
	usersModel.findOne({ name: name }, function (err, user) {
		if (err){ 
			return done(err); 
		} if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		} if (!common.User.validPassword(user, password)) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		return done(null, user);
	});
}));

router.get("/", function (req, res){
	res.render("login/login", { error : req.flash("error") });
});

router.post("/", passport.authenticate('local', { 
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true })
);

router.get("/logout", function (req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router;