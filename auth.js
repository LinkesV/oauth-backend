var passport = require("passport");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
var User = require("./models/user.js");
const user = require("./models/user.js");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET;

// USING GOOGLESTRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/google/callback",
      passReqToCallback: true,
      profileFields: ['id', 'emails', 'name','photos'] 
    },
    async (request, accessToken, refreshToken, profile, done) => {

        // DATA FROM GOOGLE 

        const id = profile.id;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        const profilePhoto = profile.photos[0].value;

      // CHECK DB WHETHER USER EXISTS

      const currentUser = await User.findOne({googleId: id})

      if(!currentUser){
        const user = new User({
            fname: firstName,
            lname: lastName,
            googleId:id,
            loggedinUsing: "google",
            pfp: profilePhoto
        })

        user.save()
        .then((user)=>{
           return done(null,user)
        })
      }
      else{
            return done(null, currentUser);
      }
    }
  )
);

//USING GITHUB STRATEGY 

passport.use(
    new GithubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "/github/callback",
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
  
          // DATA FROM GITHUB 
  
          const id = profile.id;
          const firstName = profile.displayName;
          const profilePhoto = profile.photos[0].value;

  
        // CHECK DB WHETHER USER EXISTS
  
        const currentUser = await User.findOne({gitHubId: id})
  
        if(!currentUser){
          const user = new User({
              fname: firstName,
              gitHubId:id,
              loggedinUsing: "github",
              pfp: profilePhoto
          })
  
          user.save()
          .then((user)=>{
             return done(null,user)
          })
        }
        else{
            return done(null, currentUser);
        }
      }
    )
  );


// USING FACEBOOK STRATEGY

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "/facebook/callback",
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
  
          // DATA FROM FACEBOOK 
  
          const id = profile.id;
          const firstName = profile.displayName;
          const profilePhoto = profile.photos[0].value;
          const email = profile.emails[0].value

  
        // CHECK DB WHETHER USER EXISTS
  
        const currentUser = await User.findOne({facebookId: id})
  
        if(!currentUser){
          const user = new User({
              fname: firstName,
              email:email,
              facebookId:id,
              loggedinUsing: "facebook",
              pfp: profilePhoto
          })
  
          user.save()
          .then((user)=>{
             return done(null,user)
          })
        }
        else{
            return done(null, currentUser);
        }
      }
    )
  );

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Promise error
//   function(err, user) {
//     if (err) {
//         return done(err);
//     }
//     //No user was found... so create a new user
//     if (!user) {
//         user = new User({
//             fname: profile.displayName,
//             email: profile.emails[0].value,
//             pfp: profile.photos[0],
//             loggedinUsing: 'google',
//             //now in the future searching on User.findOne({'googleId': profile.id } will match because of this next line
//             googleId: profile.id
//         });
//         user.save(function(err) {
//             if (err) console.log(err);
//             return done(err, user);
//         });
//     } else {
//         //found user. Return
//         return done(err, user);
//     }
// }

// User.findOne({
//     googleId: profile.id,
//   }).then((user) => {
//     if (!user) {
//       user = new User({
//         fname: profile.displayName,
//         // email: profile.emails[0].value,
//         // pfp: profile.photos[0],
//         loggedinUsing: "google",
//         //now in the future searching on User.findOne({'googleId': profile.id } will match because of this next line
//         googleId: profile.id,
//       });
//       user.save()
//         .then((user) => {
//           return done(err, user);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }
//     else{
//         return done(err, user)
//     }
//   })
//   .catch((err)=>{
//     return done(err)
//   })