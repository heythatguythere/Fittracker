const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

// Local Strategy for email/password
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!user.password) {
        return done(null, false, { message: 'This account was created with Google. Please use the Google sign-in option.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google Strategy for OAuth - FIXED CALLBACK URL
passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://fittracker-gules.vercel.app/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            // Check if user already exists in our DB
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                // Already have this user
                console.log('User is:', existingUser);
                done(null, existingUser);
            } else {
                // If not, create a new user in our DB
                const newUser = await new User({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value,
                    // --- THIS IS THE NEW LINE ---
                    role: 'user' // Ensures all Google signups are standard users
                }).save();
                console.log('Created new user:', newUser);
                done(null, newUser);
            }
        }
    )
);