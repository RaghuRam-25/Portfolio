const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'google' });
      if (!user) {
        // email check if they already registered locally
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        if (email) {
          user = await User.findOne({ email });
        }
        
        if (user) {
          // Link google id
          user.provider = 'google';
          user.providerId = profile.id;
          if (profile.photos && profile.photos[0]) {
            user.avatarUrl = profile.photos[0].value;
          }
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email || `${profile.id}@google-oauth.com`,
            provider: 'google',
            providerId: profile.id,
            avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            role: 'user'
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'github' });
      if (!user) {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        if (email) {
          user = await User.findOne({ email });
        }

        if (user) {
          user.provider = 'github';
          user.providerId = profile.id;
          if (profile.photos && profile.photos[0]) {
            user.avatarUrl = profile.photos[0].value;
          }
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: email || `${profile.id}@github-oauth.com`,
            provider: 'github',
            providerId: profile.id,
            avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            role: 'user'
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
