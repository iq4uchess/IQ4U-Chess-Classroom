import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "/"; // served from same origin

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [online, setOnline] = useState({});
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [game, setGame] = useState(null);
  const moveLogRef = useRef([]);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("online", (o) => setOnline(o || {}));
    s.on("challengeRequest", setIncomingChallenge);
    s.on("startGame", (g) => {
      setGame(g);
      moveLogRef.current = [];
    });
    s.on("move", (m) => {
      moveLogRef.current.push(m);
      setGame((g) => ({ ...g }));
    });

    return () => s.disconnect();
  }, []);

  const register = () => socket?.emit("register", email || "anonymous");
  const challenge = (id) => socket?.emit("challenge", id);
  const accept = () => {
    socket.emit("accept", incomingChallenge.fromId);
    setIncomingChallenge(null);
  };

  const sendMove = () => {
    const move = {
      san: "e2e4",
      by: socket.id,
      timestamp: Date.now(),
    };
    socket.emit("move", move);
    moveLogRef.current.push(move);
    setGame((g) => ({ ...g }));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Chess React Client</h1>

      <div>
        <input
          placeholder="Enter your name"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={register}>Register</button>
        <div>Status: {connected ? "Connected" : "Disconnected"}</div>
      </div>

      <h3>Online Users</h3>
      <ul>
        {Object.entries(online).map(([id, o]) => (
          <li key={id}>
            {o.email} — {id}
            {socket?.id !== id && (
              <button onClick={() => challenge(id)}>Challenge</button>
            )}
            {socket?.id === id && " (You)"}
          </li>
        ))}
      </ul>

      {incomingChallenge && (
        <div>
          <h3>Incoming Challenge</h3>
          <div>From: {incomingChallenge.email}</div>
          <button onClick={accept}>Accept</button>
        </div>
      )}

      {game && (
        <div>
          <h3>Game Started</h3>
          <div>White: {game.white}</div>
          <div>Black: {game.black}</div>
          <button onClick={sendMove}>Send Demo Move</button>

          <h4>Move Log</h4>
          <ol>
            {moveLogRef.current.map((m, i) => (
              <li key={i}>{m.san}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

