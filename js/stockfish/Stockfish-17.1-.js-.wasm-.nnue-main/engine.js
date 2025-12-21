// engine.js
// This file MUST exist to bootstrap Stockfish WASM in a Web Worker

var Module = {
  locateFile: function (path) {
    if (path.endsWith('.wasm')) {
      return './stockfish-17.1.wasm';
    }
    return path;
  }
};

// Load Stockfish engine
importScripts('./stockfish-17.1.js');
