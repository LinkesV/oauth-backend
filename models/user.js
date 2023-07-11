const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname:{
        type:String,
    },
    lname:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
        
    },
    otp:{
        type:String,
        default:null
    },
    calorietracker:{
        type:Array
    },
    weighttracker:{
        type:Array
    },
    facebookId:{
        type:String
    },
    googleId:{
        type:String
    },
    gitHubId:{
        type:String
    },
    loggedinUsing:{
        type:String
    },
    pfp:{
        type:String
    }
})
module.exports = User = mongoose.model("user",userSchema);
