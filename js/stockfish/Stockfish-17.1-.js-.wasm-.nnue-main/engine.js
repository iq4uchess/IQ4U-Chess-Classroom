// engine.js — Stockfish worker bootstrap

var Module = {
  locateFile: function (path) {
    if (path.endsWith('.wasm')) {
      return 'stockfish-17.1.wasm';
    }
    return path;
  }
};

importScripts('stockfish-17.1.js');
