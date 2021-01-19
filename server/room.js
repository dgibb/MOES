const uuid = require('uuid')
const consoles = require('../console-data.json')

function MakeRoom (data) {
  this.id = uuid.v4()
  this.name = data.name
  this.console = consoles[data.console]
  this.players = new Array(consoles[data.console].capacity).fill(null)
  this.ROM = null
  this.controllerState = {}
  this.game = 'No Game Selected'
  this.emitter = null
}

module.exports = MakeRoom
