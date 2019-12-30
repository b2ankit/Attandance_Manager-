var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');


//Require login module of Students
var singupModel=require('../modules/signup');

//Require node localStorage npm
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Define path for file
router.use(express.static(__dirname + "./public/"));


var Storage = multer.diskStorage({
  destination:function (req, file, cb) {
    cb(null, './public/images/')
  },
  
  filename:(req,file,cb) =>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});


var upload = multer({
  storage:Storage
  }).single('file');





/* GET home page. */
router.get('/', function(req, res, next) {
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  if(user!='' && imagename !=''){
    res.render('index',{title:'Attamdance_Manager',username:user,imagename:imagename});
  }
  else{
    res.render('index',{title:'Attamdance_Manager',username:'',imagename:''});
  }
});

router.get('/signup',function(req,res,next){
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  if(user!='' && imagename !=''){
    res.render('signup',{title:'Attamdance_Manager',username:user,imagename:imagename});
  }
  else{
    res.render('signup',{title:'Attamdance_Manager',username:'',imagename:''});
  }
  
})


router.post('/signup',upload,function(req,res,next){

  var uploadfilename = req.file.filename;
  // console.log(uploadfilename);
  // var success=req.file.filename+ " uploaded successfully";

  var signupDetails = new singupModel({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    imagename:uploadfilename,
  })
  signupDetails.save(function(err,res1){
    if(err) throw err;
    var msg = 'Sign Up Done Plzz login'
    var user = localStorage.getItem('loginUser');
    // res.render('login', { title: 'Password_reset',username:user,imagename:''});
    res.redirect('/login')
  })
})

router.get('/login',function(req,res,next){
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  if(user!='' && imagename !=''){
    res.render('login',{title:'Attamdance_Manager',username:user,imagename:imagename});
  }
  else{
    res.render('login',{title:'Attamdance_Manager',username:'',imagename:''});
  }
})

router.post('/login',function(req,res,next){
 
  var email=req.body.email;
  var password=req.body.password;

  var loginFilter = singupModel.findOne({$and:[{email:email},{password:password}]});
  loginFilter.exec(function(err,data){
    if(err)throw err;
    else
    { 
      if(data !==null){
      var user = data.name;
      var imagename = data.imagename;
      var id = data.id;

      //start the token
      var token = jwt.sign({userId:id},'LoginToken');

      //save signin Token in local Storage
      localStorage.setItem('userToken',token);

      //Save login username in Local Storage
      localStorage.setItem('loginUser',user);
      localStorage.setItem('userimage',imagename);
      // res.render('index',{title:'Student Records',username:user,imagename:imagename});
      res.redirect('/');
    }
    else{
      var msg = 'Invalid Username/Password' 
      
      res.render('login',{title:'Student Records',msg:msg,username:user})
      
    }
   
  }
  })

})

router.get('/forget',function(req,res,next){
  res.render('forget',{title:'Attandance_manager'});
})

router.get('/reset',function(req,res,next){
  res.render('reset',{title:'Attandance_manager'});
})


router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  localStorage.removeItem('userimage');
  res.redirect('/');
});

module.exports = router;
