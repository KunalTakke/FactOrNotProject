const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db/connection");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const db = getDb();
      const user = await db
        .collection("users")
        .findOne({ username: username.toLowerCase() });

      if (!user) {
        return done(null, false, { message: "Invalid username or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid username or password." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
