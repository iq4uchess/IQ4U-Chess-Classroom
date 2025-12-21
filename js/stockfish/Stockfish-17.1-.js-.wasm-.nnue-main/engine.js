// engine.js (Web Worker)

// Tell Stockfish exactly where the wasm file lives
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

// Forward messages correctly
self.onmessage = function (e) {
  if (typeof onmessage === 'function') {
    onmessage(e);
  }
};

// Optional debug
postMessage('engine.js loaded');
