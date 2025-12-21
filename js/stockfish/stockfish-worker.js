var Module = {
  locateFile: function (path, prefix) {
    if (path.endsWith('.wasm')) {
      return './stockfish-17.1.wasm';
    }
    return prefix + path;
  }
};

importScripts('./stockfish-17.1.js');
