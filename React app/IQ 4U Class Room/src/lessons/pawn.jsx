export const pawnLesson = {
  chapters: [
    {
      type: "teach",
      title: "Pawn Movement",
      text: "A pawn moves forward one square.",
      fen: "8/8/8/8/4P3/8/8/8 w - - 0 1"
    },
    {
      type: "assessment",
      assessmentType: "mcq",
      question: "How does a pawn move?",
      options: {
        a: "Backward",
        b: "Forward",
        c: "Like a knight",
        d: "Any direction"
      },
      correctOption: "b"
    },
    {
      type: "assessment",
      assessmentType: "square",
      question: "Select all squares the pawn can move to.",
      fen: "8/8/8/8/4P3/8/8/8 w - - 0 1",
      correctSquares: ["e3"]
    }
  ]
};
