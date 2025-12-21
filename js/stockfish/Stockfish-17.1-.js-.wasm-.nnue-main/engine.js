// engine.js — FINAL, CORRECT

var Module = {
  locateFile: function (path) {
    if (path.endsWith('.wasm')) {
      return './stockfish-17.1.wasm';
    }
    return path;
  }
};

// Load Stockfish
importScripts('./stockfish-17.1.js');

// 🔴 CRITICAL: forward messages TO Stockfish
self.onmessage = function (e) {
  if (typeof onmessage === 'function') {
    onmessage(e);
  }
};

// 🔴 CRITICAL: forward messages FROM Stockfish
if (typeof postMessage === 'function') {
  var originalPostMessage = postMessage;
  postMessage = function (msg) {
    self.postMessage(msg);
  };
}
