// engine.js — Stockfish 17.1 worker bootstrap

// IMPORTANT: path is RELATIVE TO engine.js
importScripts('stockfish-17.1.js');

// DO NOT define onmessage yourself
// DO NOT override postMessage
// Stockfish will attach them internally

// Optional: debug ping
postMessage('engine.js loaded');
