importScripts('./stockfish-17.1.js');

self.onmessage = (e) => {
  if (typeof onmessage === 'function') {
    onmessage(e);
  }
};

if (typeof postMessage === 'function') {
  postMessage('engine.js loaded');
}
