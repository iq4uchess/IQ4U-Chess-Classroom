// server.js
// Serve static site and run Socket.IO on same origin.
// Node 16+ recommended.

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const root = path.join(__dirname); // serve files from IQ4U-Chess-Classroom

// Serve static files (student.html, assets, libs)
app.use(express.static(root));

// Optional: simple index redirect to student.html
app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'student.html'));
});

const server = http.createServer(app);

// socket.io attached to same HTTP server (no CORS headaches when client is served by this server)
const io = new Server(server, {
  // default options fine for same-origin
});

const online = {}; // { socketId: { email } }

io.on('connection', (socket) => {
  // Print some handshake info for debugging
  console.log('socket connected', socket.id, 'from', socket.handshake.address, 'transport', socket.conn.transport.name);

  // Register user email
  socket.on('register', (email) => {
    const safeEmail = String(email || '').slice(0, 128);
    online[socket.id] = { email: safeEmail };
    console.log('register', socket.id, safeEmail);
    // Broadcast full online map to everyone
    io.emit('online', online);
  });

  // Challenge another player
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

  // Accept a challenge
  socket.on('accept', (fromId) => {
    console.log('accept', socket.id, 'from', fromId);
    // pair the two players (simple pairing — white = challenger)
    const white = fromId;
    const black = socket.id;
    io.to(white).emit('startGame', { white, black });
    io.to(black).emit('startGame', { white, black });
  });

  // Relay moves to others (simple broadcast; in production you'd narrow to paired partner)
  socket.on('move', (data) => {
    // you may add validation here. For now, broadcast to others.
    socket.broadcast.emit('move', data);
  });

  // cleanup on disconnect
  socket.on('disconnect', (reason) => {
    console.log('disconnect', socket.id, reason);
    delete online[socket.id];
    io.emit('online', online);
  });
});

// Start HTTP+Socket server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket server & static files listening on http://0.0.0.0:${PORT}`);
});
