const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let users = {}; // socket.id -> email

io.on("connection", (socket) => {
  socket.on("register", (email) => {
    users[socket.id] = { email };
    io.emit("online", users);
  });

  socket.on("challenge", (targetId) => {
    io.to(targetId).emit("challengeRequest", {
      fromId: socket.id,
      email: users[socket.id].email
    });
  });

  socket.on("accept", (fromId) => {
    io.to(fromId).emit("startGame", { white: fromId, black: socket.id });
    io.to(socket.id).emit("startGame", { white: fromId, black: socket.id });
  });

  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("online", users);
  });
});

server.listen(3000, () => console.log("Server running on 3000"));
