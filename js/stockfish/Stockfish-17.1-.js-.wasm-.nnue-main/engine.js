// Stockfish 17.1 Engine Wrapper
class StockfishEngine {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.isThinking = false;
        this.currentGameFen = null;
        this.onReady = null;
        this.onBestMove = null;
        this.onInfo = null;
        this.level = 5; // 1-20
        this.skillLevels = {
            1: { depth: 1, skill: 1, time: 500 },
            2: { depth: 3, skill: 3, time: 800 },
            3: { depth: 5, skill: 5, time: 1200 },
            4: { depth: 8, skill: 8, time: 1500 },
            5: { depth: 10, skill: 10, time: 2000 },
            6: { depth: 12, skill: 12, time: 2500 },
            7: { depth: 14, skill: 14, time: 3000 },
            8: { depth: 16, skill: 16, time: 3500 },
            9: { depth: 18, skill: 18, time: 4000 },
            10: { depth: 20, skill: 20, time: 5000 },
            11: { depth: 22, skill: 20, time: 6000 },
            12: { depth: 24, skill: 20, time: 7000 },
            13: { depth: 26, skill: 20, time: 8000 },
            14: { depth: 28, skill: 20, time: 9000 },
            15: { depth: 30, skill: 20, time: 10000 },
            16: { depth: 32, skill: 20, time: 12000 },
            17: { depth: 34, skill: 20, time: 14000 },
            18: { depth: 36, skill: 20, time: 16000 },
            19: { depth: 38, skill: 20, time: 18000 },
            20: { depth: 40, skill: 20, time: 20000 }
        };
    }

    async init() {
        try {
            // Check if Stockfish is already loaded
            if (typeof Stockfish === 'undefined') {
                console.error('Stockfish not loaded');
                return false;
            }

            this.engine = await Stockfish();
            this.setupMessageHandler();
            
            // Initialize engine
            this.postMessage('uci');
            this.postMessage('setoption name Use NNUE value true');
            this.postMessage('setoption name Threads value 2');
            this.postMessage('setoption name Hash value 64');
            
            return new Promise((resolve) => {
                this.onReady = () => {
                    this.isReady = true;
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
            return false;
        }
    }

    setupMessageHandler() {
        this.engine.addMessageListener((line) => {
            // console.log('Stockfish:', line);
            
            if (line === 'uciok') {
                this.postMessage('isready');
            } else if (line === 'readyok') {
                if (this.onReady) this.onReady();
            } else if (line.startsWith('bestmove')) {
                this.isThinking = false;
                if (this.onBestMove) {
                    const parts = line.split(' ');
                    const bestmove = parts.length > 1 ? parts[1] : null;
                    this.onBestMove(bestmove);
                }
            } else if (line.startsWith('info')) {
                if (this.onInfo) {
                    this.onInfo(line);
                }
            }
        });
    }

    postMessage(cmd) {
        if (this.engine) {
            this.engine.postMessage(cmd);
        }
    }

    setSkillLevel(level) {
        this.level = Math.max(1, Math.min(20, parseInt(level) || 5));
        
        // Set Stockfish skill level
        this.postMessage(`setoption name Skill Level value ${this.skillLevels[this.level].skill}`);
        this.postMessage(`setoption name Skill Level Maximum Error value ${30 - this.level}`);
        this.postMessage(`setoption name Skill Level Probability value ${5 + this.level}`);
    }

    setPosition(fen) {
        this.currentGameFen = fen;
        this.postMessage(`position fen ${fen}`);
    }

    go() {
        if (!this.isReady || this.isThinking) return;
        
        this.isThinking = true;
        const settings = this.skillLevels[this.level];
        
        // For lower levels, use depth limitation
        if (this.level <= 10) {
            this.postMessage(`go depth ${settings.depth}`);
        } else {
            // For higher levels, use time control
            this.postMessage(`go movetime ${settings.time}`);
        }
    }

    stop() {
        this.postMessage('stop');
        this.isThinking = false;
    }

    quit() {
        if (this.engine) {
            this.postMessage('quit');
            this.engine = null;
        }
        this.isReady = false;
        this.isThinking = false;
    }
}

// Export for global use
window.StockfishEngine = StockfishEngine;
