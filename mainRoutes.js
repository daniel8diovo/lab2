'use strict'

const users = [] // array of users, REPLACE WITH DATABASE

// actual routhing part
const path = require('path')
const express = require('express')
const router = express.Router()
/* mainRouter.get('/', function (req, res) {
  res.send('Hello World')
}) */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'home.html'))
})
router.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'login.html'))
})

router.get('/signup', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'))
})
// ln

// api interface for getting details from login & sign-up
router.post('/api/login', function (req, res) { // basically catches form sent by associated HTML file
  console.log('Creating the following user:', req.body.student)
  console.log('password', req.body.password)
  const info = { email: req.body.student, password: req.body.password }
  users.push(info)
  res.redirect(req.baseUrl + '/api/list')
})

router.get('/api/list', function (req, res) {
  res.send(users)
})

router.post('/api/signup', function (req, res) { // basically catches form sent by associated HTML file
  console.log('Creating the following user:', req.body.student)
  users.push(req.body.student)
// res.redirect(req.baseUrl + '/api/list')
})

/* router.post('/api/', function (req, res) { // basically catches form sent by associated HTML file
  console.log('Creating the following user:', req.body.student)
  if (req.body.student == 'login')
  // users.push(req.body.student)
  // res.redirect(req.baseUrl + '/api/list')
}) */

router.post('/api/', function (req, res) { // basically catches form sent by associated HTML file
  res.redirect(req.baseUrl + `/api/${req.body.student}`) // fix using above highlited code
})

module.exports = router
