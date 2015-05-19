var fs = require("fs");
var express = require("express");
var session = require("express-session");
var flash = require("connect-flash");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var errorHandler = require("errorHandler");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require("multer");

var app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({secret: "this is a secret"}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(multer({ 
	dest : "./uploads/",
	putSingleFilesInArray : true,
	inMemory : true
}));
app.use(express.static(__dirname + "/public"));

// development only
if ("development" == app.get("env")) {
	app.use(errorHandler());
}

mongoose.connect("mongodb://localhost/testdb");

var db = mongoose.connection;
db.on("error", function (error) {
	console.log("Error connecting to db: " + error);
});
db.once("open", function () {
	console.log("Connected to db!");
});

var userSchema = new mongoose.Schema({
	name : String,
	password : String,
	email : String,
	age : Number,
	images : [{ data : Buffer, contentType : String }]
});

var usersModel = mongoose.model("User", userSchema);

// var fileUploadComplete = function (file, req, res) {
// 	console.log("Finished uploading file!\nInserting to db...")

// 	var data = fs.readFileSync(file.path);
// 	console.log("data length: " + data.length);
// 	var contentType = "image/" + file.extension; 
// 	var image = { data : data, contentType : contentType };
// 	req.user.images.push(image);
// 	usersModel.update({ name : req.user.name}, req.user, function (error){
// 		console.log("user:\n" + req.user);
// 		if (error) {
// 			console.log("Error uploading image: " + error);
// 		}
// 	});
// };

app.get("/", function (req, res) {
	res.render("root", { user : req.user });
});

var userRoute = require("./routes/user");
var loginRoute = require("./routes/login")

app.use("/user", userRoute);
app.use("/login", loginRoute)

app.listen(app.get("port"), function () {
	console.log("Express server listening on port " + app.get("port"));
});
