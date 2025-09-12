// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static frontend files (adjust path as needed)
app.use(express.static('public'));

let players = [];

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Player joins the lobby
  socket.on('joinLobby', (playerName) => {
    // Add player if not already present
    if (!players.find(p => p.id === socket.id)) {
      players.push({ id: socket.id, name: playerName, status: '' });
    }
    io.emit('updatePlayers', players);
  });

  // Player sets status, e.g. ready or host
  socket.on('setStatus', (status) => {
    const player = players.find(p => p.id === socket.id);
    if (player) {
      player.status = status;
      io.emit('updatePlayers', players);
    }
  });

  // Player disconnects
  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('updatePlayers', players);
    console.log('user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
