'use strict'

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

async function initialize (passport, getUserByEmail, getUserById) {
  const authenticateUser = async function (email, password, done) {
    const user = await getUserByEmail(email) // putting await here fixed my damn issue
    if (user == null) {
      console.log('No User With That Email')
      return done(null, false, { message: 'No User With That Email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        console.log('Incorrect Password')
        return done(null, false, { message: 'Incorrect Password' })
      }
    } catch (err) {
      return done(err)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => { done(null, user.userid) }) // keep user in session
  passport.deserializeUser(async (id, done) => {
    await done(null, getUserById(id))
  }) // log out user from session
}

module.exports = initialize
