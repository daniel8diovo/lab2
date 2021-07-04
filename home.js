'use strict'

const express = require('express')
const app = express()

app.set('view-engine', 'ejs')
app.set('view engine', 'pug')

app.use(express.urlencoded({ extend: false }))

// loading our routers
const mainRouter = require('./mainRoutes.js')
// const lobbyRouter = require('./lobbyRoutes.js')

// mounting our routers
app.use('/', mainRouter)
app.use('/cdn', express.static('public'))

const port = process.env.PORT || 3000
app.listen(port)
console.log('Express server running on port', port)
