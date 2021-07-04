'use strict'

const db = require('./database/db.js')

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

async function creatGroup (req, res) {
  let groupFound = false

  const record = await searchGroups(req.body.group)

  if (typeof (record[0]) === 'undefined') {
    console.log('NOT IN DATABSE')
    groupFound = false
  } else {
    console.log('IN DATABASE')
    groupFound = true
  }

  if (groupFound === false) {
    try {
      const qry = `INSERT INTO groups (name) VALUES ('${req.body.group}')`

      db.pools
        .then((pool) => {
          return pool.request()
            .query(qry)
        })
        .then(result => {
          console.log('Group Added to Database')
        })

      res.redirect('/groups')
    } catch {
      res.redirect('/groups')
    }
    console.log(req.body)
  } else {
    console.log(`Group name ${req.body.group} already taken`)
    console.log('Primary key: ', req.session.passport.user)
  }
}

module.exports = { create: creatGroup }
