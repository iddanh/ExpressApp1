var express = require("express");
var router = express.Router();
var common = require("../common.js");
var usersModel = require("mongoose").model("User");

//ALL USERS
router.get("/", function (req, res) {
	usersModel.find({}, function (error, users) {
		res.render("u/allUsers", { "users" : users});
	});
});

router.param("userName", function (req, res, next, userName) {
	usersModel.findOne({ name : userName }, function (error, user) {
		req.myUser = user;
		next();
	});
});

//NEW USER
router.get("/add", function (req, res) {
	res.render("u/addUser");
});

//VIEW USER
router.get("/:userName", function (req, res) {
	if (req.myUser) {
		var isLoggedIn = req.user != undefined && req.user.name === req.myUser.name;
		res.render("u/user", { user: req.myUser, isLoggedIn : isLoggedIn, image : new Buffer(req.myUser.images[0].data).toString("base64") });
		console.log("user images length: " + req.myUser.images.length);
		// console.log(new Buffer(req.myUser.images[0].data).toString("base64"));
	} else {
		res.send("No user by that name!!!");
	}
});

//CREATE USER
router.post("/", function (req, res) {
	var b = req.body;
	var newUser = new usersModel(new common.User(b.name, b.password, b.email, b.age));
	newUser.save(function (error, user) {
		if (error) {
			res.send("Error saving user: " + error);
		} else {
			res.redirect("/user/" + user.name);
		}
	});
});

//EDIT USER
router.get("/:userName/edit", function(req, res){
	if (req.user && req.myUser.name === req.user.name) {
		res.render("u/editUser", { user: req.myUser });
	} else {
		res.redirect("/login");
	}
});

//UPDATE USER
router.post("/:userName/edit", function (req, res, next){
	if (!req.user || req.myUser.name !== req.user.name) {
		next();
		console.log("this should not print")
	}
	var b = req.body;
	var editedUser = new common.User(b.name, b.password, b.email, b.age);
	usersModel.update({name : req.myUser.name}, editedUser, function(error){
		if(error){
			res.send("Error updating user: " + error);
		} else {
			res.redirect("/user/" + b.name);
		}
	});
});

//REMOVE USER
router.get("/:userName/delete", function(req, res){
	usersModel.remove({ name: req.myUser.name }, function (error) {
		if (error) {
			res.send("Unable to delete user: " + errer);
		} else {
			res.redirect("/user");
		}
	});
});

router.get("/:userName/upload", function (req, res){
	if (req.user && req.myUser.name === req.user.name) {
		res.render("u/upload", { user : req.myUser });
	} else {
		res.redirect("/login");
	}
});

router.post("/:userName/upload", function (req, res, next){
	var file = req.files["fileUpload"][0];
	console.log(file);
	var image = { data : file.buffer, contentType : file.mimetype };
	//req.myUser.images.push(image);
	var myUser = req.myUser;
	var editedUser = new common.User(myUser.name, myUser.password, myUser.email, myUser.age, [image]);
	usersModel.update({ name: req.myUser.name}, editedUser, function (error){
		if (error) {
			console.log("Error uploading image: " + error);
		}	
		res.send("<html><body><p>Image uploaded succesfully!</p><meta http-equiv='refresh' content='3;url=.'' /></body></html>");
		next();
	});
});

module.exports = router;