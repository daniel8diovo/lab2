'use strict'

/*
  Class to remove or add user in groups when voting
*/
class User {
  constructor (email, passHash) {
    this.email = email
    this.passHash = passHash
    this.groups = []
  }

  getEmail () {
    return this.email
  }

  getPassHash () {
    return this.passHash
  }

  getGroups () {
    return this.groups
  }

  setEmail (email) {
    this.email = email
  }

  setPassHash (passHash) {
    this.passHash = passHash
  }

  addGroup (group) {
    this.groups.push(group)
  }

  removeGroup (group) {
    const index = this.groups.indexOf(group)
    if (index > -1) {
      this.groups.splice(index, 1)
    }
  }
}

/*
  Class to manage groups comes here
*/

module.exports = User
