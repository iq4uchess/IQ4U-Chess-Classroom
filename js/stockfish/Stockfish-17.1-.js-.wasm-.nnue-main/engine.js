// engine.js — Web Worker for Stockfish 17.1

// CRITICAL: Tell Emscripten where the WASM file is
self.Module = {
  locateFile: function (path) {
    if (path.endsWith('.wasm')) {
      return './stockfish-17.1.wasm';
    }
    return path;
  }
};

// Load Stockfish engine
importScripts('./stockfish-17.1.js');

// Forward messages between main thread and Stockfish
self.onmessage = function (e) {
  if (typeof self.onmessage === 'function') {
    self.onmessage(e);
  }
};

// Debug confirmation
postMessage('engine.js loaded');
