import { useEffect, useRef, useState } from "react";
import { Chessground } from "chessground";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import lesson1_thechessboard from "../lessons/lesson1_thechessboard";
import { saveLessonProgress } from "../services/firebase";

export default function Classroom() {
  const { user, loading } = useAuth();

  /* ================= AUTH GUARD ================= */
  if (!loading && !user) {
    return (
      <div className="page">
        <div className="card" style={{ marginTop: "24px", textAlign: "center" }}>
          <p>Please login to continue.</p>
        </div>
      </div>
    );
  }

  /* ================= EXISTING ENGINE ================= */

  const { levelId = "beginner-1", lessonId = "lesson-1" } = useParams();
  const lesson = lesson1_thechessboard;

  /* ===== Phase 10A-1: sessionStorage key (persist only) ===== */
  const STORAGE_KEY = `iq4u_assessment_${levelId}_${lessonId}`;

  const boardRef = useRef(null);
  const groundRef = useRef(null);

  /* ================= TEACHING ================= */
  const [pageIndex, setPageIndex] = useState(0);
  const teachingPages = lesson.teaching;
  const page = teachingPages[pageIndex];

  const teachingQuestion = page?.teachingQuestion;
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [teachingValidation, setTeachingValidation] = useState(null);

  /* ================= ASSESSMENT ================= */
  const assessmentQuestions = lesson.assessment || [];
  const totalQuestions = assessmentQuestions.length;

  const [assessmentStatus, setAssessmentStatus] = useState("idle");
  // idle | confirm_start | in_progress | completed

  const [assessmentIndex, setAssessmentIndex] = useState(0);

  const [assessmentAnswers, setAssessmentAnswers] = useState(
    assessmentQuestions.map(() => ({
      answered: false,
      skipped: false,
      answer: null,
      locked: false,
      isCorrect: null
    }))
  );

  const [finalScore, setFinalScore] = useState(null);
  const [passed, setPassed] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = assessmentQuestions[assessmentIndex];
  const currentAnswer = assessmentAnswers[assessmentIndex];

  /* ===== Phase 10A-1: PERSIST ONLY (no restore) ===== */
  useEffect(() => {
    if (assessmentStatus !== "in_progress") return;

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          assessmentIndex,
          assessmentAnswers
        })
      );
    } catch {
      // intentionally silent (QA hardening)
    }
  }, [assessmentStatus, assessmentIndex, assessmentAnswers, STORAGE_KEY]);

  /* ================= BOARD INIT ================= */
  const initBoard = (fen) => {
    groundRef.current?.destroy?.();

    groundRef.current = Chessground(boardRef.current, {
      fen,
      draggable: { enabled: true },
      selectable: { enabled: true },
      movable: { free: true, color: "both" },
      events: {
        move: (from, to) => {
          if (
            assessmentStatus === "in_progress" &&
            currentQuestion?.type === "pgn" &&
            !currentAnswer.locked
          ) {
            const move = `${from}${to}`;
            setAssessmentAnswers((prev) => {
              const next = [...prev];
              next[assessmentIndex] = {
                ...next[assessmentIndex],
                answered: true,
                answer: move
              };
              return next;
            });
          }
        },
        select: (sq) => {
          if (
            assessmentStatus === "idle" &&
            teachingQuestion?.type === "square-selection"
          ) {
            setSelectedSquares((prev) =>
              prev.includes(sq)
                ? prev.filter((s) => s !== sq)
                : [...prev, sq]
            );
          }

          if (
            assessmentStatus === "in_progress" &&
            currentQuestion?.type === "square-selection" &&
            !currentAnswer.locked
          ) {
            setAssessmentAnswers((prev) => {
              const next = [...prev];
              const cur = next[assessmentIndex].answer || [];
              next[assessmentIndex] = {
                ...next[assessmentIndex],
                answered: true,
                answer: cur.includes(sq)
                  ? cur.filter((s) => s !== sq)
                  : [...cur, sq]
              };
              return next;
            });
          }
        }
      }
    });
  };

  /* ================= BOARD EFFECT ================= */
  useEffect(() => {
    if (!boardRef.current) return;

    if (assessmentStatus === "idle" && page) {
      initBoard(page.fen);
      setSelectedSquares([]);
      setTeachingValidation(null);
    }

    if (
      (assessmentStatus === "in_progress" ||
        assessmentStatus === "confirm_start") &&
      currentQuestion
    ) {
      initBoard(currentQuestion.fen);
    }
  }, [pageIndex, assessmentStatus, assessmentIndex]);

  /* ================= TEACHING VALIDATION ================= */
  const validateTeaching = () => {
    if (!teachingQuestion) return;

    const correct = teachingQuestion.correctSquares
      .slice()
      .sort()
      .join(",");
    const selected = selectedSquares.slice().sort().join(",");

    setTeachingValidation(correct === selected);
  };

  /* ================= ASSESSMENT SUBMIT ================= */
  const submitAssessment = () => {
    if (!currentAnswer.answered || currentAnswer.locked) return;

    let isCorrect = false;

    if (currentQuestion.type === "mcq") {
      isCorrect = currentAnswer.answer === currentQuestion.correctAnswer;
    }

    if (currentQuestion.type === "square-selection") {
      const a = (currentAnswer.answer || []).slice().sort().join(",");
      const c = currentQuestion.correctSquares.slice().sort().join(",");
      isCorrect = a === c;
    }

    if (currentQuestion.type === "pgn") {
      isCorrect = currentQuestion.correctMoves.includes(
        currentAnswer.answer
      );
    }

    setAssessmentAnswers((prev) => {
      const next = [...prev];
      next[assessmentIndex] = {
        ...next[assessmentIndex],
        locked: true,
        isCorrect
      };
      return next;
    });
  };

  /* ================= NEXT / COMPLETE ================= */
  const nextAssessment = () => {
    setAssessmentAnswers((prev) => {
      const next = [...prev];
      if (!next[assessmentIndex].answered) {
        next[assessmentIndex] = {
          ...next[assessmentIndex],
          skipped: true,
          locked: true,
          isCorrect: false
        };
      }
      return next;
    });

    if (assessmentIndex < totalQuestions - 1) {
      setAssessmentIndex((i) => i + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = async () => {
    let correctCount = 0;
    assessmentAnswers.forEach((a) => {
      if (a.isCorrect) correctCount += 1;
    });

    const percentage = Math.round(
      (correctCount / totalQuestions) * 100
    );

    setFinalScore(percentage);
    const passStatus = percentage >= 60;
    setPassed(passStatus);
    setAssessmentStatus("completed");
    setShowResult(true);

    if (user) {
      await saveLessonProgress({
        uid: user.uid,
        levelId,
        lessonId,
        score: percentage,
        completed: passStatus
      });
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="page">
      <div className="classroom-header">
        {assessmentStatus === "idle" && lesson.meta.title}
        {assessmentStatus === "confirm_start" && "Assessment"}
        {assessmentStatus === "in_progress" &&
          `Assessment – Question ${assessmentIndex + 1} of ${totalQuestions}`}
        {assessmentStatus === "completed" && "Assessment Result"}
      </div>

      <div className="classroom-body">
        <div className="card board-panel">
          <div ref={boardRef} className="chessboard-container" />
        </div>

        <div className="card content-panel">
          {assessmentStatus === "confirm_start" && (
            <>
              <h3>Assessment is about to begin</h3>
              <p>
                You are about to start the assessment. You cannot retry
                individual questions. Make sure you are ready.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn"
                  onClick={() => setAssessmentStatus("idle")}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={() => setAssessmentStatus("in_progress")}
                >
                  Start Assessment
                </button>
              </div>
            </>
          )}

          {assessmentStatus === "idle" && page && (
            <>
              <h3>{page.title}</h3>
              <p>{page.content}</p>

              {teachingQuestion && (
                <>
                  <p>
                    <strong>Selected Squares:</strong>{" "}
                    {selectedSquares.join(", ") || "None"}
                  </p>

                  {teachingValidation !== null && (
                    <p
                      style={{
                        fontWeight: 600,
                        color: teachingValidation ? "#27ae60" : "#c0392b"
                      }}
                    >
                      {teachingValidation ? "Correct" : "Incorrect"}
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {assessmentStatus === "in_progress" && currentQuestion && (
            <>
              <h3>{currentQuestion.question}</h3>

              {currentQuestion.type === "mcq" &&
                currentQuestion.options.map((opt) => (
                  <label key={opt} style={{ display: "block" }}>
                    <input
                      type="radio"
                      disabled={currentAnswer.locked}
                      checked={currentAnswer.answer === opt}
                      onChange={() =>
                        setAssessmentAnswers((prev) => {
                          const next = [...prev];
                          next[assessmentIndex] = {
                            ...next[assessmentIndex],
                            answered: true,
                            answer: opt
                          };
                          return next;
                        })
                      }
                    />
                    {opt}
                  </label>
                ))}

              {currentQuestion.type === "square-selection" && (
                <>
                  <p>
                    <strong>Selected Squares:</strong>{" "}
                    {(currentAnswer.answer || []).join(", ") || "None"}
                  </p>

                  {currentAnswer.locked && (
                    <p>
                      <strong>Correct Squares:</strong>{" "}
                      {currentQuestion.correctSquares.join(", ")}
                    </p>
                  )}
                </>
              )}

              {currentQuestion.type === "pgn" && (
                <p>
                  <strong>Move played:</strong>{" "}
                  {currentAnswer.answer || "None"}
                </p>
              )}

              {currentAnswer.locked && (
                <p
                  style={{
                    marginTop: 12,
                    fontWeight: 600,
                    color: currentAnswer.isCorrect
                      ? "#27ae60"
                      : "#c0392b"
                  }}
                >
                  {currentAnswer.isCorrect ? "Correct" : "Incorrect"}
                </p>
              )}
            </>
          )}

          {assessmentStatus === "completed" && showResult && (
            <>
              <h2>🎉 Congratulations!</h2>
              <p>
                Score: <strong>{finalScore}%</strong>
              </p>
              <p>
                Status: <strong>{passed ? "Pass" : "Fail"}</strong>
              </p>
              <button
                className="btn"
                onClick={() => setShowResult(false)}
              >
                Back to Lessons
              </button>
            </>
          )}

          {assessmentStatus === "completed" && !showResult && (
            <h3>
              Final Score: {finalScore}% ({passed ? "Pass" : "Fail"})
            </h3>
          )}
        </div>
      </div>

      {assessmentStatus !== "completed" &&
        assessmentStatus !== "confirm_start" && (
          <div className="classroom-footer">
            <button
              className="btn"
              onClick={() =>
                assessmentStatus === "idle"
                  ? setPageIndex((i) => Math.max(i - 1, 0))
                  : setAssessmentIndex((i) => Math.max(i - 1, 0))
              }
            >
              Previous
            </button>

            <button
              className="btn"
              onClick={
                assessmentStatus === "idle"
                  ? validateTeaching
                  : submitAssessment
              }
              disabled={
                assessmentStatus === "idle"
                  ? !teachingQuestion
                  : !currentAnswer.answered || currentAnswer.locked
              }
            >
              Submit
            </button>

            <button
              className="btn"
              onClick={
                assessmentStatus === "idle"
                  ? () =>
                      pageIndex === teachingPages.length - 1
                        ? setAssessmentStatus("confirm_start")
                        : setPageIndex((i) => i + 1)
                  : nextAssessment
              }
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
