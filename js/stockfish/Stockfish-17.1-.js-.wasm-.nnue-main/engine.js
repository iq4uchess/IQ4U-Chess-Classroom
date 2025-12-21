// engine.js — standalone Stockfish worker bootstrap

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
