const lesson1_thechessboard = {
  meta: {
    id: "lesson-1",
    title: "THE CHESS BOARD",
    level: "Beginner",
    order: 1,
    passcode: "1234"
  },

  teaching: [
    {
      id: 1,
      title: "Introduction to the Chessboard",
      content:
        "The chessboard has 64 squares arranged in 8 rows (ranks) and 8 columns (files).",
      fen: "8/8/8/8/8/8/8/8 w - - 0 1"
    },
    {
      id: 2,
      title: "Board Coordinates",
      content:
        "Files are labeled from a to h and ranks from 1 to 8. Select the square e4.",
      fen: "8/8/8/8/8/8/8/8 w - - 0 1",
      teachingQuestion: {
        type: "square-selection",
        correctSquares: ["e4"]
      }
    }
  ],

  assessment: [
    {
      id: "q1",
      type: "mcq",
      question: "How many squares are there on a chessboard?",
      options: ["32", "48", "64", "100"],
      correctAnswer: "64"
    },
    {
      id: "q2",
      type: "square-selection",
      question: "Select all central squares.",
      fen: "8/8/8/8/8/8/8/8 w - - 0 1",
      correctSquares: ["d4", "e4", "d5", "e5"]
    },
    {
      id: "q3",
      type: "pgn",
      question: "Play the correct opening move for White.",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      correctMoves: ["e4", "d4"]
    }
  ]
};

export default lesson1_thechessboard;
