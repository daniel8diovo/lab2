// Here we access the chat form so we can display messages on webpage
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const groupName = document.getElementById('room-name')
const userList = document.getElementById('users')

// Get username and romm from URL
const { username, room } = Qs.parse(window.location.search, {
  ignoreQueryPrefix: true
})

const socket = io()

// Join chat room, emit username and room name to server
socket.emit('JoinRoom', { username, room })

// Gte group users and display on side bar
socket.on('Your Study Buddies ;-)', ({ room, users }) => {
  outputGroupName(room)
  outputUsers(users)
})

// Message submit
/*
    messages is now an object with username, text & time from format message function
    we can access the text by calling message.text, time by message.time and so on...
*/
socket.on('message', message => {
  console.log(message.text) // get message text
  outputMessage(message)
  //   outputUser(message)
  //   outputTime(message)

  // Scroll down whenever message new received
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// Add event listener for submission of the message
chatForm.addEventListener('submit', (e) => {
  // prevent form from automatically submitting to a file
  e.preventDefault()

  //   Get text input from message submission
  //   when user submits the message, we get the message from the
  //   text input and just log it on the console
  const msg = e.target.elements.msg.value

  //   console.log(msg)
  // Emit message to server
  socket.emit('chatMessage', msg)

  // clear out the chat input box after sending message
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

// Output message to DOM
function outputMessage (message) {
  const div = document.createElement('div')
  div.classList.add('message')
  // here we set the innerHTM to the message a user submits
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
  // message will display on page
  // whenever user sends a message it should add a new div to class of chat-messages
  document.querySelector('.chat-messages').appendChild(div)
}

// Add group name to DOM
function outputGroupName () {
  groupName.innerText = room
}

// Add list of users to DOM
function outputUsers (users) {
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}`
}
