// server.js
// Minimal Socket.IO server that keeps an "online" map and broadcasts updates.
// Node 16+ recommended.

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Allow all origins for testing. For production, set a specific origin.
const io = new Server(server, {
  cors: { origin: '*' }
});

const online = {}; // { socketId: { email } }

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // register the user's email
  socket.on('register', (email) => {
    console.log('register', socket.id, email);
    online[socket.id] = { email: String(email || '').slice(0,128) };
    // broadcast the current online map to everyone
    io.emit('online', online);
  });

  // challenge another player by socket id
  socket.on('challenge', (targetId) => {
    console.log('challenge', socket.id, '->', targetId);
    const fromEmail = online[socket.id] && online[socket.id].email;
    if(io.sockets.sockets.get(targetId)){
      io.to(targetId).emit('challengeRequest', { fromId: socket.id, email: fromEmail });
      socket.emit('challenge_sent', { ok: true });
    } else {
      socket.emit('challenge_declined', { email: 'offline' });
    }
  });

  // accept a challenge
  socket.on('accept', (fromId) => {
    console.log('accept', socket.id, 'from', fromId);
    // simple pairing: send startGame to both
    const white = fromId;
    const black = socket.id;
    io.to(white).emit('startGame', { white, black });
    io.to(black).emit('startGame', { white, black });
  });

  // move forwarded to others
  socket.on('move', (data) => {
    socket.broadcast.emit('move', data);
  });

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
    delete online[socket.id];
    io.emit('online', online);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`));
