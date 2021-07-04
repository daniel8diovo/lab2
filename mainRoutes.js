'use strict'

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
// actual routhing part
const path = require('path')
const express = require('express')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const router = express.Router()
const methodOverride = require('method-override')
const db = require('./src/database/db.js')
const url = require('url')
// const createGroup = require('./src/createGroup')
const Group = require('./src/createGroup')

async function searchGroups (groupName) {
  const qry = `SELECT * FROM groups WHERE name = '${groupName}'`

  const sql = db.sql
  const config = db.config
  try {
    const pool = await sql.connect(config)
    const request = await pool.request().query(qry)

    return request.recordset
  } catch (err) {
    console.log(err)
  }
}

// mounting our routers

const initialisePassport = require('./passport-config')
initialisePassport(
  passport,
  async function (email) {
    // let data
    const qry = `SELECT * FROM users WHERE username = '${email}'`
    const sql = db.sql
    const config = db.config
    try {
      const pool = await sql.connect(config)
      const request = await pool.request().query(qry)

      // console.log(request.recordset[0])
      return request.recordset[0]
    } catch (err) {
      console.log(err)
    }
  },
  async function (id) {
    const qry = `SELECT * FROM users WHERE userid = '${id}'`
    const sql = db.sql
    const config = db.config
    try {
      const pool = await sql.connect(config)
      const request = await pool.request().query(qry)

      // console.log(request.recordset[0])
      return request.recordset[0]
    } catch (err) {
      console.log(err)
    }
  }
)

router.use(flash())
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))
router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))

router.get('/', checkNotAuthenticated, function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'home.html'))
})

router.get('/lobby', checkAuthenticated, function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'lobby.html'))
})

router.get('/login', checkNotAuthenticated, function (req, res) {
  res.render('login.ejs')
})

router.get('/signup', checkNotAuthenticated, function (req, res) {
  res.render('signup.ejs')
})

router.get('/groups', checkAuthenticated, function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'group.html'))
})

router.get('/searchgroups', checkAuthenticated, function (req, res) {
  res.render('group-search.pug', {
    title: 'Groups',
    items: req.query
  })
})

router.get('/mygroups', checkAuthenticated, function (req, res) {
  res.render('groups.pug', {
    title: 'Groups',
    items: req.query
  })
})

// api interface for getting details from login & sign-up
router.post('/api/login', checkNotAuthenticated, passport.authenticate('local', {
  // successRedirect: '/',
  successRedirect: '/lobby',
  failureRedirect: '/login',
  failureFlash: true
}))
router.get('/onlinemeeting', checkAuthenticated, function (req, res) {
  res.render('meeting.ejs')
})

const groups = []
function addGroup (group) {
  groups.push(group)
}
router.get('/removemember', function (req, res) {
  res.render('removeuser.ejs')
})

router.post('/api/removemember', async function (req, res) {
  console.log(req.session)
  // const qry = 'SELECT * FROM users'
  // const sql = db.sql
  // const config = db.config
  try {
    const pool = await db.pools
    // const pool = await sql.connect(config)
    const request = await pool.request().query('SELECT * FROM user_groups WHERE groupfk = 2')
    request.recordset.forEach(group => {
      addGroup(group)
    })
    res.json(groups)
    console.log(groups)
  } catch (err) {
    console.log(err)
  }
  res.redirect('/login')
})

router.get('/lobby', checkAuthenticated, async function (req, res) {
  let qry = `SELECT * FROM notifications WHERE userid = '${req.session.identify}'`
  let sql = db.sql
  let config = db.config
  let sourceid = 0
  let text = ''
  let date = ''
  try {
    const pool = await sql.connect(config)
    const request = await pool.request().query(qry)
    sourceid = request.recordset[0].sourceid
    text = request.recordset[0].message_text
    date = request.recordset[0].created
  } catch (err) {
    console.log(err)
  }
  qry = `SELECT * FROM users WHERE userid = '${sourceid}'`
  sql = db.sql
  config = db.config
  let sourceuser = ''
  try {
    const pool = await sql.connect(config)
    const request = await pool.request().query(qry)
    sourceuser = request.recordset[0].username
  } catch (err) {
    console.log(err)
  }
  const fulltext = sourceuser + ' ' + text + '\n' + ' created on' + date
  res.render('lobby.ejs', { identifier: req.session.identify, notification: fulltext })
})

// api interface for getting details from login & sign-up

router.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err) }
    if (!user) { return res.redirect('/login') }
    req.login(user, (err) => {
      if (err) { return next(err) }
      req.session.identify = req.user.userid
      return res.redirect('/lobby')
    })
  })(req, res, next)
})

router.post('/api/signup', checkNotAuthenticated, async function (req, res) { // basically catches form sent by associated HTML file
  let userFound
  const qry = `SELECT * FROM users WHERE username = '${req.body.email}'`
  const sql = db.sql
  const config = db.config
  try {
    const pool = await sql.connect(config)
    const request = await pool.request().query(qry)

    // const pool = await db.pools
    // const request = await pool.request().query(qry)

    if (typeof (request.recordset[0]) === 'undefined') {
      console.log('NOT IN DATABSE')
      userFound = false
    } else {
      console.log('IN DATABASE')
      userFound = true
    }
  } catch (err) {
    console.log(err)
  }

  if (userFound === false) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      // store this in dataBase
      const sql = `INSERT INTO users (username, password) VALUES ('${req.body.email}','${hashedPassword}')`

      db.pools
        .then((pool) => {
          return pool.request()
            .query(sql)
        })
        .then(result => {
          console.log('Added to Database')
        })
      res.redirect('/login')
    } catch {
      res.redirect('/signup')
    }
  } else {
    console.log('Username/Email already taken')
  }
})

router.post('/api/meeting', checkAuthenticated, async function (req, res) {
  const today = new Date()
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
  const qry = `INSERT INTO notifications (userid, sourceid, notification_type, message_text, created, group_number) VALUES (10,'${req.session.passport.user}',1,${req.body.meeting},${date},8)`
  console.log(qry)
  /* try {
    db.pools
      .then((pool) => {
        return pool.request()
          .query(qry)
      })
      .then(result => {
        console.log('Added to Database')
      })
    res.redirect('/lobby')
  } catch {
    res.redirect('/onlinemeeting')
  } */
  const sql = db.sql
  const config = db.config
  try {
    const pool = await sql.connect(config)
    await pool.request().query(qry)

    console.log('Notification added')
  } catch (err) {
    console.log(err)
  }
})

router.delete('/logout', function (req, res) {
  req.logOut()
  res.redirect('/login')
})

router.post('/api/createGroup', checkAuthenticated, async function (req, res) {
  Group.create(req, res)
})

router.post('/api/joinGroup', checkAuthenticated, async function (req, res) {
  console.log('data from join button: ' + req.body.name)

  const record = await searchGroups(req.body.name)

  const groupid = record[0].id
  console.log('This the group id:', groupid)

  const sql = `INSERT INTO user_groups (userfk, groupfk) VALUES ('${req.session.passport.user}','${groupid}')`

  try {
    db.pools
      .then((pool) => {
        return pool.request()
          .query(sql)
      })
      .then(result => {
        console.log(`Succesfully joined ${req.body.name}`)
      })

    res.redirect('/login')
  } catch {
    res.redirect('/signup')
  }
  console.log(req.body.name)
})

router.get('/api/userGroups', checkAuthenticated, async function (req, res) {
  let records
  const groups = []

  const qry = `SELECT name FROM groups A INNER JOIN user_groups B ON A.id = B.groupfk where userfk = '${req.session.passport.user}' `

  const sql = db.sql
  const config = db.config
  try {
    const pool = await sql.connect(config)
    const request = await pool.request().query(qry)

    records = request.recordset
    console.log(records)
  } catch (err) {
    console.log(err)
  }

  records.forEach(function (record) { // extract IDs from recordset and place in array
    groups.push(record.name)
  })

  console.log(groups)

  res.redirect(url.format({
    pathname: '/mygroups',
    query: groups
  }))
})

router.post('/api/searchgroups', checkAuthenticated, async function (req, res) {
  let groupFound = false
  const groups = []

  const records = await searchGroups(req.body.group)

  if (typeof (records[0]) === 'undefined') {
    console.log('NOT IN DATABSE')
    groupFound = false
  } else {
    console.log('IN DATABASE')
    groupFound = true
  }

  records.forEach(function (record) { // extract group names from recordset and place in array
    groups.push(record.name)
  })

  console.log(groups)

  if (groupFound === true) {
    res.redirect(url.format({
      pathname: '/searchgroups',
      query: groups
    }))
  } else {
  // res.redirect()
    console.log('group not found')
  }
})

function checkAuthenticated (req, res, next) { // middelware function to protect routes, that is no routes should be accessible if not logged in
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated (req, res, next) { //  should not be able to go to log-in page if succesfully logged in
  if (req.isAuthenticated()) {
    return res.redirect('/lobby') // lobby in our case, fix this one lobby page is made
  }

  next()
}

module.exports = router
