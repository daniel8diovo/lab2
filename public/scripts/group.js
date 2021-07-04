'use strict'

// let db = require('./db.js')

/* const input = document.getElementById('group-name')
input.addEventListener('input', function () {
  const groupName = String(input.value)
  $.post('/api/search', { name: groupName })
  // Append <p> to <body>
}, false) */

// let button
const button = document.getElementById('join-group')
button.addEventListener('click', function () {
  const input = document.getElementById('group')
  const groupName = String(input.innerHTML)
  $.post('/api/joinGroup', { name: groupName })
}, false)
