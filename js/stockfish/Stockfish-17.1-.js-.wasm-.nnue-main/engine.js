// Tell Stockfish where the WASM file lives
self.Module = {
  locateFile: (path) => {
    if (path.endsWith('.wasm')) {
      return './stockfish-17.1.wasm';
    }
    return path;
  }
};

importScripts('./stockfish-17.1.js');


self.onmessage = (e) => {
  if (typeof onmessage === 'function') {
    onmessage(e);
  }
};
