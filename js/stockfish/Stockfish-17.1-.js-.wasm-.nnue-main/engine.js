// engine.js — Stockfish Web Worker bridge

importScripts('./stockfish-17.1.js');

// Forward messages FROM Stockfish → main thread
self.postMessage = self.postMessage.bind(self);

// Forward messages FROM main thread → Stockfish
self.onmessage = function (e) {
  if (typeof self.stockfish === 'function') {
    self.stockfish(e.data);
  } else if (typeof onmessage === 'function') {
    onmessage(e);
  }
};

// Notify UI that worker booted
self.postMessage('engine.js loaded');
