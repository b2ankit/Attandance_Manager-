var mongoose = require('mongoose');

bodyparser = require("body-parser");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


mongoose.connect('mongodb://localhost:27017/Attandance_manager',{useNewUrlParser: true, useUnifiedTopology: true})


var conn = mongoose.Connection;

var signupSchema = new mongoose.Schema({
    name:String,
    email:{type: String, unique: true, required: true},
    password:String,
    imagename:String, 
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    
});
var signupModel = mongoose.model('login',signupSchema);

module.exports=signupModel;