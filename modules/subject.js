var mongoose = require('mongoose');

bodyparser = require("body-parser");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


mongoose.connect('mongodb://localhost:27017/Attandance_manager',{useNewUrlParser: true, useUnifiedTopology: true})


var conn = mongoose.Connection;

var subjectSchema = new mongoose.Schema({
    primary_key:String,
    subject:String,
    present:Number,
    absent:Number,
    percentage:Number,
});
var subjectModel = mongoose.model('subject',subjectSchema);

module.exports=subjectModel;