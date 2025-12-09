// server.js (updated)
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

// Add a permissive cors for dev/testing (OK locally; tighten for production)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  },
  // Slightly more tolerant ping/pong for flaky dev networks
  pingInterval: 25000,
  pingTimeout: 120000
});

const online = {}; // { socketId: { email } }

io.on('connection', (socket) => {
  console.log('socket connected', socket.id, 'from', socket.handshake.address, 'transport', socket.conn.transport.name);

  socket.on('register', (email) => {
    const safeEmail = String(email || '').slice(0, 128);
    online[socket.id] = { email: safeEmail };
    console.log('register', socket.id, safeEmail);
    io.emit('online', online);
  });

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

  socket.on('accept', (fromId) => {
    console.log('accept', socket.id, 'from', fromId);
    const white = fromId;
    const black = socket.id;
    io.to(white).emit('startGame', { white, black });
    io.to(black).emit('startGame', { white, black });
  });

  socket.on('move', (data) => {
    socket.broadcast.emit('move', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('disconnect', socket.id, reason);
    delete online[socket.id];
    io.emit('online', online);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket server & static files listening on http://0.0.0.0:${PORT}`);
});
