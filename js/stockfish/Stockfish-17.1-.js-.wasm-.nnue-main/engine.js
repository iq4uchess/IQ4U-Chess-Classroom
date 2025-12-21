// engine.js — FINAL FIX

var Module = {
  locateFile: function (path) {
    if (path.endsWith('.wasm')) {
      return './stockfish-17.1.wasm';
    }
    return path;
  }
};

// Load Stockfish WASM engine
importScripts('./stockfish-17.1.js');

// Forward messages FROM UI → Stockfish
self.onmessage = function (e) {
  if (typeof onmessage === 'function') {
    onmessage(e);
  }
};

// ❌ DO NOT override postMessage
// Stockfish already posts messages correctly
