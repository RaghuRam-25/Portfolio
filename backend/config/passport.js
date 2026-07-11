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

// ============================================================
// নিরাপদ OAuth লিংকিং হেল্পার (C2 fix — account-takeover প্রতিরোধ)
//   - প্রথমে providerId দিয়ে বিদ্যমান OAuth ইউজার খোঁজা হয়।
//   - ইমেইল দিয়ে লিংক করা হয় শুধুমাত্র যখন প্রোভাইডার ইমেইলটি "verified" নিশ্চিত করে।
//   - কোনো local (password) অ্যাকাউন্টকে কখনো ওভাররাইট/ডিমোট করা হয় না —
//     শুধু providerId যোগ করা হয়, provider অপরিবর্তিত থাকে, তাই password login কাজ করতেই থাকে।
//   - unverified ইমেইল বিদ্যমান কোনো অ্যাকাউন্টের সাথে মিললে লিংক করা হয় না (takeover ব্লক)।
// ============================================================
const findOrLinkOAuthUser = async ({ provider, profile, emailVerified }) => {
  // ১. আগে থেকেই এই প্রোভাইডার-আইডি দিয়ে অ্যাকাউন্ট আছে কিনা
  let user = await User.findOne({ providerId: profile.id, provider });
  if (user) {
    if (profile.photos && profile.photos[0] && !user.avatarUrl) {
      user.avatarUrl = profile.photos[0].value;
      await user.save();
    }
    return { user };
  }

  const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';

  // ২. ইমেইল দিয়ে বিদ্যমান অ্যাকাউন্ট খোঁজা
  if (email) {
    const existing = await User.findOne({ email });
    if (existing) {
      // নিরাপত্তা: ইমেইল verified না হলে লিংক করা হবে না (impersonation প্রতিরোধ)
      if (!emailVerified) {
        return { user: false, message: 'This email is already registered. Please log in with your password to link this provider.' };
      }
      // verified — providerId যোগ করা হয়, কিন্তু local provider অপরিবর্তিত রাখা হয়
      if (!existing.providerId) {
        existing.providerId = profile.id;
      }
      if (existing.provider !== 'local' && existing.provider !== provider) {
        // একটি ভিন্ন OAuth প্রোভাইডার — নিরাপদে বর্তমানটিতে সেট করা হয়
        existing.provider = provider;
        existing.providerId = profile.id;
      }
      if (profile.photos && profile.photos[0] && !existing.avatarUrl) {
        existing.avatarUrl = profile.photos[0].value;
      }
      await existing.save();
      return { user: existing };
    }
  }

  // ৩. নতুন ইউজার তৈরি
  user = await User.create({
    name: profile.displayName || profile.username,
    email: email || `${profile.id}@${provider}-oauth.com`,
    provider,
    providerId: profile.id,
    avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
    role: 'user',
  });
  return { user };
};

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Google email_verified ফ্ল্যাগ (boolean অথবা string 'true' হতে পারে)
      const rawVerified = (profile._json && profile._json.email_verified) ??
        (profile.emails && profile.emails[0] && profile.emails[0].verified);
      const emailVerified = rawVerified === true || rawVerified === 'true';

      const { user, message } = await findOrLinkOAuthUser({ provider: 'google', profile, emailVerified });
      return done(null, user, message ? { message } : undefined);
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
      // passport-github2 নির্ভরযোগ্যভাবে verified ফ্ল্যাগ দেয় না — শুধু explicit true হলেই verified ধরা হয়।
      const emailVerified = !!(profile.emails && profile.emails[0] && profile.emails[0].verified === true);

      const { user, message } = await findOrLinkOAuthUser({ provider: 'github', profile, emailVerified });
      return done(null, user, message ? { message } : undefined);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
