var usersModel = require("mongoose").model("User");

//USER PROTOTYPE
//**************
exports.User = function User(name, password, email, age, images){
	this.name = name;
	this.password = password;
	this.email = email;
	this.age = age;
	this.images = images;
}
exports.User.findByName = function (name, next){
	usersModel.findOne({ name : name }, function (error, user){
		next(error, user);
	});
};
exports.User.validPassword = function(user, password){
		return password === user.password;
	};
//***************