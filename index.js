const express = require("express");
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const cors = require('cors');
const bcrypt = require('bcrypt');
var User = require('./models/user.js')
require("./auth.js");
var passport = require('passport');
var cookieSession = require('cookie-session')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({
    origin:true
}));

app.use(
    cookieSession({ name: "login", keys: ["linkes"], maxAge: 24 * 60 * 60 * 100 })
  );

require('dotenv').config()
const port = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL
const MONGODB = process.env.MONGODB_ATLUS

app.use(passport.initialize());
app.use(passport.session());

const saltrounds = 10; //Bcrypt
mongoose.connect(MONGODB , {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log('Connected to the database')
})
.catch((err)=>{
    console.log(err)
})

// FAILED LOGIN 

app.get('/login/failed', (req,res)=>{
    res.send({login:false, message:"Login Unsuccessful"})
})

// SUCCESSFUL LOGIN 

app.get('/login/success/:id', (req,res)=>{
    const id = req.params.id                                                          
    User.findOne({_id:id})
    .then((user)=>{
        res.send({login:true,user:user})
    })
    .catch((err)=>{
        res.send({login:false})

    })
})


//LOGOUT METHOD

app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect(CLIENT_URL)
})


// GOOGLE LOGIN METHOD

app.get('/google',passport.authenticate("google",{ scope: ["profile"] }))

// CALLBACK FUNCTION FOR GOOGLE

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login/failed', failureMessage: true }),
function(req, res) {
    res.writeHead(301, {
        Location: `https://mellifluous-sorbet-281589.netlify.app/${req.user._id}`
      }).end();
});


// GITHUB LOGIN METHOD

app.get('/github',passport.authenticate('github',{ scope: ["profile"] }))

// CALLBACK FUNCTION FOR GITHUB

app.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login/failed', failureMessage: true }),
function(req, res) {
    res.writeHead(301, {
        Location: `https://mellifluous-sorbet-281589.netlify.app/${req.user._id}`
      }).end();
    
});

// FACEBOOK LOGIN METHOD

app.get('/facebook',passport.authenticate('facebook',{ scope: ["profile"] }))

// CALLBACK FUNCTION FOR FACEBOOK

app.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login/failed', failureMessage: true }),
function(req, res) {
    res.writeHead(301, {
        Location: `https://mellifluous-sorbet-281589.netlify.app/${req.user._id}`
      }).end();
    
});


// NORMAL LOGIN 

app.post('/normallogin',(req,res)=>{
    User.findOne({email:req.body.email})
    .then((user)=>{
        if(!user){
            res.send({login:false,message:"Invalid email"})
        }
        else{
           if(user.loggedinUsing !== 'normal'){
                res.send({login:false,message:`You have logged in using ${user.loggedinUsing} before. Use same method of logging in`})
           }
           else{
            bcrypt.compare(req.body.password,user.password,function (err,result){
                if(result == true){
                    res.send({login:true,id:user._id})
                }
                else{
                    res.send({login:false,message:"Invalid password"})

                }
            })
           }
        }
    })
})


// NORMAL SIGN UP 

app.post('/createuser',(req,res)=>{
    bcrypt.hash(req.body.password, saltrounds, function(err,hash){
        const user = new User({
            fname: req.body.fname,
            lname:req.body.lname,
            email: req.body.email,
            password: hash, //HASH FROM Bcrypt
            loggedinUsing:"normal",
            pfp:req.body.url,
        })

        user.save()
        .then(()=>{
            res.send({message:"Account created successfully. You may login Now"})
        })
        .catch((err)=>{
            console.log(err)
        })
    })
})

// FORGOT PSW SEND EMAIL

app.post('/sendemail',async (req,res)=>{
    await User.findOne({email:req.body.email})
    .then(async (user)=>{
        if(!user){
            res.send({email:false,message:"Invalid email"})
        }
        else{
            if(user.loggedinUsing != "normal"){
                res.send({email:false,message:`You have logged in previously using ${user.loggedinUsing}`})
            }
            else{
                let otp = `${Math.random().toString(36).substring(2,7)}`
                res.send({email:true,message:"Check your email for OTP and click on link in the email",OTP:otp, id:user._id, useremail:user.email, username: user.fname})
                await User.findOneAndUpdate({email:req.body.email},{otp:otp})
            }
        }
    })
})

// CHECK OTP
app.post('/checkotp',async (req,res)=>{
    await User.findOne({_id:req.body.id})
    .then(async (user)=>{
       if(user.otp == req.body.otp){
             res.send({result:true,message:"OTP is correct, enter your new password"})
        }
        else{
            res.send({result:false,message:"OTP is wrong"})
        }  
    })
})

// CHANGE PASSWORD

app.post('/changepsw',(req,res)=>{
    bcrypt.hash(req.body.password, saltrounds, function(err,hash){
        User.findByIdAndUpdate({_id:req.body.id},{password:hash})
        .then(()=>{
            res.send({message:'Password updated successfully'})
        })
    })
})

// UPDATE WEIGHT

app.post('/updateweight',(req,res)=>{
    User.findByIdAndUpdate({_id:req.body.id},{weighttracker:req.body.weighttracker})
    .then(()=>{
        res.send({message:"Weight data updated successfully"})
    })
})

// UPDATE CALORIES

app.post('/updatecalorie',(req,res)=>{
    User.findByIdAndUpdate({_id:req.body.id},{calorietracker:req.body.calorietracker})
    .then(()=>{
        res.send({message:"Calorie data updated successfully"})
    })
})


app.listen(port,()=>{
    console.log(`Listening at port ${port}`)
})
