var Module = {
  locateFile: function (path) {
    if (path.endsWith('.wasm')) {
      return self.location.origin +
        '/IQ4U-Chess-Classroom/js/stockfish/stockfish-17.1.wasm';
    }
    return path;
  }
};

importScripts(
  self.location.origin +
  '/IQ4U-Chess-Classroom/js/stockfish/stockfish-17.1.js'
);
