const express = require('express')
const path = require('path')
const MakeRoom = require('./room.js')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const rooms = {}
const connections = []
// const users = []

server.listen(process.env.PORT || 8080)

console.log('server running...')

app.use(express.static(path.resolve(__dirname, '..', 'Client')))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'Client', 'index.html'))
})

app.get('/:url', (req, res) => {
  console.log('hi')
  res.sendFile(path.resolve(__dirname, '..', 'Client', `${req.params.url}.html`))
})

io.sockets.on('connection', (socket) => {
  connections.push({ socket: socket })
  console.log('connected: %s sockets connected', connections.length)

  socket.on('create-room', (message) => {
    const room = new MakeRoom(message)
    socket.join(room.id)
    rooms[room.id] = room
    socket.emit('create-confirm', { room: room.id, player: 0 })
    console.log('room created', room)
  })

  socket.on('load-Rom', (message) => {
    rooms[message.context.room].ROM = message.data.ROM
    console.log('rom file loaded')
  })

  socket.on('join-room', (message) => {
    const room = rooms[message.context.room]
    if (room.players.indexOf(null) !== -1) {
      socket.join(room.id)
      socket.player = room.players.indexOf(null)
      socket.room = room.id
      room.players[socket.player] = socket
      socket.emit('assign-player', {
        player: socket.player
      })
      console.log('socket joined room ', room.id, 'as player', socket.player)
    } else {
      socket.emit('join-room-denied', 'Room at capacity')
    }
  })

  socket.on('start-game', (message) => {
    io.sockets.to(rooms[message.context.room]).emit('starting-game')
    rooms[message.context.room].emitter = setInterval(() => {
      io.sockets.to(rooms[message.context.room]).emit('update-controller-state', rooms[message.context.room].controllerState)
    }, 16)
  })

  socket.on('stop-game', (message) => {
    clearInterval(rooms[message.context.room].emitter)
  })

  socket.on('request-room-info', (message) => {
    socket.emit('return-room-info', rooms[message])
  })

  socket.on('keypress', (message) => {
    console.log(message)
    rooms[message.context.room].controllerState[message.context.player] = message.data
  })
})
