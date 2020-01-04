var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


//Require login module of Students
var singupModel=require('../modules/signup');

var subjectModel = require('../modules/subject');


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


//middleware for login user check
function checkloginuser(req,res,next){
  var user  = localStorage.getItem('loginUser');
  if(user==null){
    res.redirect('/login');
  }
  next();
}


/* GET home page. */
router.get('/', function(req, res, next) {
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  var key = localStorage.getItem('primary_key');
  if(user!='' && imagename !=''){
    var subjectfind = subjectModel.find({'primary_key':key});
    subjectfind.exec(function(err,data){
      if(err) throw err;
      res.render('index',{title:'Attandance_Manager',username:user,imagename:imagename,records:data});
    })
    
  }
  else{
    res.render('index',{title:'Attandance_Manager',username:'',imagename:'',records:''});
  }
});

router.get('/signup',function(req,res,next){
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  if(user!='' && imagename !=''){
    res.render('signup',{title:'Attandance_Manager',username:user,imagename:imagename});
  }
  else{
    res.render('signup',{title:'Attandance_Manager',username:'',imagename:''});
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
    res.render('login',{title:'Attandance_Manager',username:user,imagename:imagename});
  }
  else{
    res.render('login',{title:'Attandance_Manager',username:'',imagename:''});
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
      var email = data.email;

      //start the token
      var token = jwt.sign({userId:id},'LoginToken');

      //save signin Token in local Storage
      localStorage.setItem('userToken',token);

      //Save login username in Local Storage
      localStorage.setItem('loginUser',user);
      localStorage.setItem('userimage',imagename);
      localStorage.setItem('primary_key',email);
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

router.get('/addsub',checkloginuser,function(req,res,next){
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  if(user!='' && imagename !=''){
    res.render('addsub',{title:'Attandance_Manager',username:user,imagename:imagename});
  }
  else{
    res.render('addsub',{title:'Attandance_Manager',username:'',imagename:''});
  }
})


router.post('/addsub',checkloginuser,function(req,res,next){
  var key = localStorage.getItem('primary_key');

  var subjectDetails = new subjectModel({
    primary_key:key,
    subject : req.body.subject,
    present:0,
    absent:0,
    percentage:0,
    
  })
  subjectDetails.save(function(err,res1){
    if(err) throw err;
    
    res.redirect('/')
  })
})


router.get('/present/:id',checkloginuser,function(req,res,next){
  var id = req.params.id;
  var persentfind = subjectModel.findById(id);
  persentfind.exec(function(err,data){
    if(err)throw err;
    var present = data.present;
    var absent = data.absent;
    present++;
    if(absent!=0){
      var per = Math.round((present*100)/(present+absent));
    }
    else if(absent==0 && present !=0){
      var per = 100;
    }

  var presentupdate = subjectModel.findByIdAndUpdate(id,{present:present,percentage:per});
  presentupdate.exec(function(err,res){
    if(err) throw err;
  });
  });
  res.redirect('/');
})


router.get('/absent/:id',checkloginuser,function(req,res,next){
  var id = req.params.id;
  var absentfind = subjectModel.findById(id);
  absentfind.exec(function(err,data){
    if(err)throw err;
    var absent = data.absent;
    var present = data.present;
    absent++;
    if(absent!=0){
      var per = Math.round((present*100)/(present+absent));
    }
    else if(absent==0 && present!=0){
      var per = 100;
    }

  var presentupdate = subjectModel.findByIdAndUpdate(id,{absent:absent,percentage:per});
  presentupdate.exec(function(err,res){
    if(err) throw err;
  });
  });
  res.redirect('/');
})

router.get('/delete/:id',checkloginuser,function(req,res,next){
  var id = req.params.id;
  var delete_entry = subjectModel.findByIdAndDelete(id);
  delete_entry.exec(function(err,res1){
    if(err) throw err;
    res.redirect('/');
  })
})

router.get('/edit/:id',checkloginuser,function(req,res,next){
  var id = req.params.id;
  var user = localStorage.getItem('loginUser');
  var imagename = localStorage.getItem('userimage');
  var editdetails = subjectModel.find({_id:id});
  editdetails.exec(function(err,data){
  if(err) throw err;
  res.render('edit',{title:'Attandance_Manager',username:user,imagename:imagename,records:data});
  })
  
})

router.post('/edit',checkloginuser,function(req,res,next){
  var id = req.body.userid;
  var present = parseInt(req.body.present);
  var absent = parseInt(req.body.absent);
  var per;
  if(absent!=0){
    per = Math.round((present*100)/(present+absent));

  }
  else{
    per = 100;
  }

  var updatedetails = subjectModel.findByIdAndUpdate(id,{
    subject:req.body.subject,
    present:req.body.present,
    absent:req.body.absent,
    percentage:per,
  })
  updatedetails.exec(function(err,data){
    if(err) throw err;
    res.redirect('/');
  })
})

router.get('/forget',function(req,res,next){
 res.render('forget',{title:'Attandance_Manager',username:'',imagename:''});
})

// router.get('/reset',function(req,res,next){
//   res.render('reset',{title:'Attandance_Manager',username:'',imagename:''});
//  })


router.post('/forget',function(req,res,next){
  async.waterfall([
    function(done){
      crypto.randomBytes(20,function(err,buf){
        var token = buf.toString('hex');
        done(err,token);
      });
    },
    function(token,done){
      singupModel.findOne({email:req.body.email},function(err,user){
        if(!user){
          console.log('Error No account with the email Id');
          // req.flash('error', 'No account with that email address exists.');
          return res.redirect('/signup');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() +3600000;

        user.save(function(err){
          done(err,token,user);
        });
      });
    },
    function(token,user,done){
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'ankit19351@gmail.com',
          pass: 'your password'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'ankit19351@gmail.com',
        subject: 'Node.js Attandance Manager Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        // alert("link send to register Email");
        // req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ],function(err){
    if(err) return next(err);
    res.redirect('/forget');
  });
});

router.get('/reset/:token', function(req, res) {
  singupModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      // req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token,title:'Attandance Manager',username:'',imagename:''});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      singupModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          console.log('error Password reset token is invalid or has expired.');
          return res.redirect('back');
        }else{
          var user_id = user._id;
          if(req.body.password === req.body.confirm) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            var update = singupModel.findByIdAndUpdate(user_id,{password:req.body.password});
            update.exec(function(err,data){
              if(err) throw err;
              return res.redirect('/login');
            })
          } 
          else {
              console.log("error Passwords do not match.");
              return res.redirect('back');
          }
        }
        
      });
    },
  
  ], function(err) {
    res.redirect('/login');
  });
});

















router.get('/logout',checkloginuser, function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  localStorage.removeItem('userimage');
  localStorage.removeItem('primary_key');
  res.redirect('/');
});

module.exports = router;
