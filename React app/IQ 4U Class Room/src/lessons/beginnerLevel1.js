const beginnerLevel1 = {
  id: "beginner-1",
  title: "Beginner Level 1",
  lessons: {
    "lesson-1": {
      title: "THE CHESS BOARD",
      chapters: [
        {
          id: 1,
          title: "Introduction to the Chessboard",
          content:
            "The chessboard has 64 squares arranged in 8 rows and 8 columns. Each square alternates in color.",
          fen: "8/8/8/8/8/8/8/8"
        },
        {
          id: 2,
          title: "Board Coordinates",
          content:
            "Columns are labeled from a to h, and rows are numbered from 1 to 8. Select the square e4.",
          fen: "8/8/8/8/8/8/8/8",
          teachingQuestion: {
            type: "square-selection",
            correctSquares: ["e4"]
          }
        },
        {
          id: 3,
          title: "Multiple Squares",
          content:
            "Select all four central squares on the chessboard.",
          fen: "8/8/8/8/8/8/8/8",
          teachingQuestion: {
            type: "square-selection",
            correctSquares: ["d4", "e4", "d5", "e5"]
          }
        }
      ]
    }
  }
};

export default beginnerLevel1;
