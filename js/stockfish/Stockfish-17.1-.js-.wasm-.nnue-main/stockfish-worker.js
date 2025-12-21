// js/stockfish/engine.js
// Stockfish 17.1 + WASM + NNUE (FINAL, WORKING)

let engine = null;
let ready = false;
let onBestMove = null;

const ENGINE_URL =
  './Stockfish-17.1-.js-.wasm-.nnue-main/stockfish-17.1.js';

const NNUE_URL =
  './Stockfish-17.1-.js-.wasm-.nnue-main/stockfish-17.1.nnue';

export function startStockfish(callback) {
  if (engine) return;

  onBestMove = callback;
  engine = new Worker(ENGINE_URL);

  engine.onmessage = (e) => {
    const msg = e.data;
    console.log('[Stockfish]', msg);

    if (msg === 'uciok') {
      engine.postMessage(`setoption name EvalFile value ${NNUE_URL}`);
      engine.postMessage('isready');
    }

    if (msg === 'readyok') {
      ready = true;
      console.log('✅ Stockfish ready (NNUE loaded)');
    }

    if (msg.startsWith('bestmove')) {
      const move = msg.split(' ')[1];
      if (onBestMove) onBestMove(move);
    }
  };

  engine.postMessage('uci');
}

export function askStockfishMove(fen, movetime = 2000) {
  if (!engine || !ready) return;

  engine.postMessage('ucinewgame');
  engine.postMessage('position fen ' + fen);
  engine.postMessage(`go movetime ${movetime}`);
}

export function stopStockfish() {
  if (engine) engine.postMessage('stop');
}

export function destroyStockfish() {
  if (!engine) return;
  engine.terminate();
  engine = null;
  ready = false;
}

