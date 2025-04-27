const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userController = require('./controllers/userController');
const User = require('./models/user');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/cartfulAuthClient/response',
}, 
async (accessToken, refreshToken, profile, done) => {
  console.log('[GoogleStrategy] Profile received:', profile.emails[0].value);

  try {
    let user = await userController.findUserByEmailforPassportHelp(profile.emails[0].value); 

    if (!user) {
      console.log('[GoogleStrategy] User not found. Creating...');
      user = await userController.createGoogleUser(profile); // This is correct
    }

    return done(null, user);
  } catch (err) {
    console.error('[GoogleStrategy] Error:', err);
    return done(err);
  }
}));

passport.use(new LocalStrategy(
  { usernameField: 'email' },  // Tell passport we use email instead of username
  async (email, password, done) => {
    console.log('[LocalStrategy] Incoming login for:', email);
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('[LocalStrategy] No user found');
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      if (user.password !== password) {
        console.log('[LocalStrategy] Incorrect password');
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      if (!user.emailVerified) {
        console.log('[LocalStrategy] Email not verified');
        return done(null, false, { message: 'Please verify your email before logging in.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

  passport.serializeUser((user, done) => {
    done(null, user._id);  // Store only the user ID in the session
  });
  
  // Deserialize user from session (fetching the full user data)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userController.findUserByIdForPassportHelper(id); // 'id' must be MongoDB _id
      done(null, user);
    } catch (err) {
      done(err);
    }
  });


  module.exports = passport; 